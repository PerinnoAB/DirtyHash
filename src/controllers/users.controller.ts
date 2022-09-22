// import { Controller, Param, Body, Get, Post, Put, Delete, HttpCode, UseBefore } from 'routing-controllers';
// import { OpenAPI } from 'routing-controllers-openapi';
// import { CreateUserDto } from '@dtos/users.dto';
// import { User } from '@interfaces/users.interface';
// import userService from '@services/users.service';
// import { validationMiddleware } from '@middlewares/validation.middleware';

// @Controller()
// export class UsersController {
//   public userService = new userService();

//   @Get('/users')
//   @OpenAPI({ summary: 'Return a list of users' })
//   async getUsers() {
//     const findAllUsersData: User[] = await this.userService.findAllUser();
//     return { data: findAllUsersData, message: 'findAll' };
//   }

//   @Get('/users/:id')
//   @OpenAPI({ summary: 'Return find a user' })
//   async getUserById(@Param('id') userId: number) {
//     const findOneUserData: User = await this.userService.findUserById(userId);
//     return { data: findOneUserData, message: 'findOne' };
//   }

//   @Post('/users')
//   @HttpCode(201)
//   @UseBefore(validationMiddleware(CreateUserDto, 'body'))
//   @OpenAPI({ summary: 'Create a new user' })
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

//   async createUser(@Body() userData: CreateUserDto) {
//     const createUserData: User = await this.userService.createUser(userData);
//     return { data: createUserData, message: 'created' };
//   }

//   @Put('/users/:id')
//   @UseBefore(validationMiddleware(CreateUserDto, 'body', true))
//   @OpenAPI({ summary: 'Update a user' })
//   async updateUser(@Param('id') userId: number, @Body() userData: CreateUserDto) {
//     const updateUserData: User[] = await this.userService.updateUser(userId, userData);
//     return { data: updateUserData, message: 'updated' };
//   }

//   @Delete('/users/:id')
//   @OpenAPI({ summary: 'Delete a user' })
//   async deleteUser(@Param('id') userId: number) {
//     const deleteUserData: User[] = await this.userService.deleteUser(userId);
//     return { data: deleteUserData, message: 'deleted' };
//   }
// }
