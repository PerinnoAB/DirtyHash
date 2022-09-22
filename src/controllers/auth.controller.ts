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

// import { Response } from 'express';
// import { Controller, Req, Body, Post, UseBefore, HttpCode, Res } from 'routing-controllers';
// import { CreateUserDto } from '@dtos/users.dto';
// import { RequestWithUser } from '@interfaces/auth.interface';
// import { User } from '@interfaces/users.interface';
// import authMiddleware from '@middlewares/auth.middleware';
// import { validationMiddleware } from '@middlewares/validation.middleware';
// import AuthService from '@services/auth.service';

// @Controller()
// export class AuthController {
//   public authService = new AuthService();

//   @Post('/signup')
//   @UseBefore(validationMiddleware(CreateUserDto, 'body'))
//   @HttpCode(201)
//   async signUp(@Body() userData: CreateUserDto) {
//     const signUpUserData: User = await this.authService.signup(userData);
//     return { data: signUpUserData, message: 'signup' };
//   }

//   @Post('/login')
//   @UseBefore(validationMiddleware(CreateUserDto, 'body'))
//   async logIn(@Res() res: Response, @Body() userData: CreateUserDto) {
//     const { cookie, findUser } = await this.authService.login(userData);

//     res.setHeader('Set-Cookie', [cookie]);
//     return { data: findUser, message: 'login' };
//   }

//   @Post('/logout')
//   @UseBefore(authMiddleware)
//   async logOut(@Req() req: RequestWithUser, @Res() res: Response) {
//     const userData: User = req.user;
//     const logOutUserData: User = await this.authService.logout(userData);

//     res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
//     return { data: logOutUserData, message: 'logout' };
//   }
// }
