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

import { Report } from '@/interfaces/report.interface';
import { getCollection, isEmpty } from '@/utils/util';
import FirestoreService from './firestore.service';
import validator from 'validator';
import { isEmail, isURL } from 'class-validator';
import { SENDGRID_API_KEY, SENDGRID_TEMPLATE_ID, REPORT_EMAIL } from '@config';

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(SENDGRID_API_KEY);

class ReportService {
  public firestoreService = new FirestoreService();
  reportsCollectionName = 'reports';

  private sendUserEmail(payload: Report) {
    if (isEmpty(payload.email)) return;

    if (isEmail(payload.email)) {
      const msg = {
        to: payload.email,
        from: REPORT_EMAIL,
        bcc: REPORT_EMAIL,
        templateId: SENDGRID_TEMPLATE_ID,
        dynamicTemplateData: {
          reporterName: payload.name,
          reportString: payload.reportString,
        },
      };

      sgMail
        .send(msg)
        .then(() => {
          // console.log('Email sent');
        })
        .catch(error => {
          console.error('Error sending report email', error);
        });
    }
  }

  private sendOpsEmail(payload: Report) {
    // send email to DH Ops team
    const msg = {
      to: 'contact@dirtyhash.com', // Change to your recipient
      from: 'contact@dirtyhash.com', // Change to your verified sender
      subject: 'New user report: ' + payload.reportString,
      text: 'report',
      html:
        '<p>Abuser: ' +
        payload.abuser +
        '</p><p>Category: ' +
        payload.category +
        ' </p><p>Description: ' +
        payload.description +
        ' </p><p>Email: ' +
        payload.email +
        ' </p><p>Name: ' +
        payload.name +
        ' </p><p>Other: ' +
        payload.otherCategory +
        ' </p><p>Url: ' +
        payload.url +
        '</p>',
    };
    sgMail
      .send(msg)
      .then(() => {
        // console.log('Email sent');
      })
      .catch(error => {
        console.error('Error sending report email', error);
      });
  }

  public async createReport(payload: Report): Promise<any> {
    console.log('Report payload: ', payload);
    this.sendOpsEmail(payload);

    // All user reports will be manually verified offline and then blacklisted 
    // // Check the string reported and act to the relevant collections
    // if (!isEmpty(payload.reportString)) {
    //   this.reportEntity(payload.reportString, payload);
    // }

    // // If report contains URL
    // if (!isEmpty(payload.url) && payload.reportString !== payload.url) {
    //   this.reportEntity(payload.url, payload);
    // }

    // // If report abuser details
    // if (!isEmpty(payload.abuser)) {
    //   if (validator.isEmail(payload.abuser) || payload.abuser.startsWith('@') || payload.abuser.endsWith('.eth')) {
    //     this.reportEntity(payload.abuser, payload);
    //   }
    // }

    this.sendUserEmail(payload);

    return this.firestoreService.addDoc(this.reportsCollectionName, payload);
  }

  private reportEntity(entity: string, payload: Report) {
    entity = entity.trim();
    const [queryCollection, transformedString] = getCollection(entity);
    const doc = this.firestoreService.getDoc(queryCollection, transformedString);

    const comment = {
      timestamp: new Date().getTime(),
      comment: payload.description,
      name: payload.name,
      email: payload.email,
    };
    const reportData = {};
    // user reports will always be incremented
    reportData['first-reported'] = new Date().getTime();
    reportData['category'] = payload.category;
    reportData['subcategory'] = payload.otherCategory;
    reportData['source'] = 'DirtyHash';

    if (!isEmpty(payload.abuser)) {
      reportData['abuser'] = payload.abuser;
    }
    if (!isEmpty(payload.url) && isURL(payload.url)) {
      reportData['url'] = payload.url;
    }

    // if this already exists in DB
    if (!isEmpty(doc)) {
      // add description to user comments collection
      this.firestoreService.addUserComment(queryCollection, transformedString, comment);
    } else {
      this.firestoreService.setDoc(queryCollection, transformedString, reportData);
      this.firestoreService.addUserComment(queryCollection, transformedString, comment);
    }

    this.firestoreService.updateReports(queryCollection, transformedString);
  }
}

export default ReportService;
