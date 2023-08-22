/* Copyright 2022 Perinno AB. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

// import { compare, hash } from 'bcrypt';
// import { sign } from 'jsonwebtoken';
// import { SECRET_KEY } from '@config';
// import { CreateUserDto } from '@dtos/users.dto';
// import { HttpException } from '@exceptions/HttpException';
// import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
// import { User } from '@interfaces/users.interface';
// import userModel from '@models/users.model';
import { isEmpty, searchRequiresQuota } from '@utils/util';
import FirestoreService from './firestore.service';
import { SENDGRID_API_KEY, SENDGRID_TEMPLATE_ID_TRACK_WALLET, SENDGRID_TEMPLATE_ID_STOP_TRACK_WALLET, REPORT_EMAIL } from '@config';
import { CreateReportDto } from '@/dtos/reports.dto';
import ReportService from './report.service';
import { ReportCategory } from '@/interfaces/report.interface';

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(SENDGRID_API_KEY);

class AuthService {
  // public users = userModel;
  public firestoreService = new FirestoreService();
  public reportService = new ReportService();

  public async shouldServeRequest(apiKey: string, authToken: string, query: string): Promise<Boolean> {
    // if credentials are not provided, return true, as these requests will be throttled at the load balancer
    if (isEmpty(apiKey) && isEmpty(authToken)) {
      return true;
    }

    if (!isEmpty(authToken)) {
      const decodedToken = await this.firestoreService.decodeAuthToken(authToken);
      if (decodedToken) {
        console.log('Valid token found: ', decodedToken.email);

        let remaingQuota = 1;
        if (searchRequiresQuota(query)) {
          remaingQuota = await this.firestoreService.getUserRemainingQuota(decodedToken.email);
          console.log('User: ', decodedToken.email, 'Remaining Quota: ', remaingQuota);
        }
        await this.firestoreService.logUserSearch(decodedToken.email, query);
        return remaingQuota > 0 ? true : false;

        // Allow searches for loggedin users
        // return true;
      }
    } else if (!isEmpty(apiKey)) {
      let remaingQuota = 1;
      let email = '';
      if (searchRequiresQuota(query)) {
        [remaingQuota, email] = await this.firestoreService.getAPIKeyRemainingQuota(apiKey);
        console.log('API Key: ', apiKey, 'Email: ', email, 'Remaining Quota: ', remaingQuota);
      }
      await this.firestoreService.logUserSearch(email, query);
      return remaingQuota > 0 ? true : false;
    }
    return false;
  }

  public async logUserReport(authToken: string, reportString: string, category: ReportCategory, otherCategory: string, url: string, abuser: string, description: string, name: string, email: string): Promise<Boolean> {
    if (!isEmpty(authToken)) {
      const decodedToken = await this.firestoreService.decodeAuthToken(authToken);
      if (decodedToken) {
        console.log('Valid token found: ', decodedToken.email);
        await this.firestoreService.logUserReport(decodedToken.email, reportString);

        const reportData = new CreateReportDto(reportString, category, otherCategory, url, abuser, description, name, email);
        // Write report to data without waiting for it to finish
        this.reportService.createReport(reportData, decodedToken.email);
        return true;
      }
    }
    return false;
  }

  private sendUserEmail(userEmail: string, addr: string, chain: string, templateID: string) {
    if (isEmpty(userEmail)) return;

    const msg = {
      to: userEmail,
      from: REPORT_EMAIL,
      bcc: REPORT_EMAIL,
      templateId: templateID,
      dynamicTemplateData: {
        walletAddress: addr,
        chainName: chain,
      },
    };

    sgMail
      .send(msg)
      .then(() => {
        // console.log('Email sent');
      })
      .catch(error => {
        console.error('Error sending track/untrack email', error);
      });
  }

  public async getSearchCredits(authToken: string): Promise<number> {
    if (!isEmpty(authToken)) {
      const decodedToken = await this.firestoreService.decodeAuthToken(authToken);
      if (decodedToken) {
        const remaingQuota = await this.firestoreService.getUserRemainingQuota(decodedToken.email, 0);
        console.log('User: ', decodedToken.email, 'Remaining Quota: ', remaingQuota);
        return remaingQuota;
      } else {
        console.log('No valid token');
      }
    }
    return 0;
  }

  public async getUserDashboard(authToken: string): Promise<any> {
    if (!isEmpty(authToken)) {
      const decodedToken = await this.firestoreService.decodeAuthToken(authToken);
      if (decodedToken) {
        const dashboardData = await this.firestoreService.getUserDashboard(decodedToken.email);
        // console.log('User: ', decodedToken.email, 'Dashboard: ', dashboardData);
        return dashboardData;
      } else {
        console.log('No valid token');
      }
    }
    return null;
  }

  public async trackWallet(authToken: string, address: string, chain: string) {
    if (!isEmpty(authToken)) {
      const decodedToken = await this.firestoreService.decodeAuthToken(authToken);
      if (decodedToken) {
        const res = await this.firestoreService.trackWallet(decodedToken.email, address, chain);
        console.log('User: %s Tracking Wallet: %s Chain: %s', decodedToken.email, address, chain);
        this.sendUserEmail(decodedToken.email, address, chain.toUpperCase(), SENDGRID_TEMPLATE_ID_TRACK_WALLET);
        return res;
      }
    }
    return false;
  }

  public async stopTrackWallet(authToken: string, address: string, chain: string) {
    if (!isEmpty(authToken)) {
      const decodedToken = await this.firestoreService.decodeAuthToken(authToken);
      if (decodedToken) {
        const res = await this.firestoreService.stopTrackWallet(decodedToken.email, address, chain);
        console.log('User: %s Stop Tracking Wallet: %s Chain: %s', decodedToken.email, address, chain);
        this.sendUserEmail(decodedToken.email, address, chain.toUpperCase(), SENDGRID_TEMPLATE_ID_STOP_TRACK_WALLET);
        return res;
      }
    }
    return false;
  }

  public async statusTrackWallet(authToken: string, address: string, chain: string) {
    if (!isEmpty(authToken)) {
      const decodedToken = await this.firestoreService.decodeAuthToken(authToken);
      if (decodedToken) {
        const res = await this.firestoreService.statusTrackWallet(decodedToken.email, address, chain);
        console.log('User: %s Status Tracking Wallet: %s Chain: %s Result: %s', decodedToken.email, address, chain, res);
        return res;
      }
    }
    return false;
  }
  // public async signup(userData: CreateUserDto): Promise<User> {
  //   if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

  //   const findUser: User = this.users.find(user => user.email === userData.email);
  //   if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

  //   const hashedPassword = await hash(userData.password, 10);
  //   const createUserData: User = { id: this.users.length + 1, ...userData, password: hashedPassword };

  //   return createUserData;
  // }

  // public async login(userData: CreateUserDto): Promise<{ cookie: string; findUser: User }> {
  //   if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

  //   const findUser: User = this.users.find(user => user.email === userData.email);
  //   if (!findUser) throw new HttpException(409, `This email ${userData.email} was not found`);

  //   const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
  //   if (!isPasswordMatching) throw new HttpException(409, 'Password is not matching');

  //   const tokenData = this.createToken(findUser);
  //   const cookie = this.createCookie(tokenData);

  //   return { cookie, findUser };
  // }

  // public async logout(userData: User): Promise<User> {
  //   if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

  //   const findUser: User = this.users.find(user => user.email === userData.email && user.password === userData.password);
  //   if (!findUser) throw new HttpException(409, "User doesn't exist");

  //   return findUser;
  // }

  // public createToken(user: User): TokenData {
  //   const dataStoredInToken: DataStoredInToken = { id: user.id };
  //   const secretKey: string = SECRET_KEY;
  //   const expiresIn: number = 60 * 60;

  //   return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  // }

  // public createCookie(tokenData: TokenData): string {
  //   return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  // }
}

export default AuthService;
