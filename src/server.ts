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

import App from '@/app';
// import { AuthController } from '@controllers/auth.controller';
// import { UsersController } from '@controllers/users.controller';
import { QueryController } from './controllers/query.controller';
import validateEnv from '@utils/validateEnv';
import { ReportController } from './controllers/report.controller';
import { HealthController } from './controllers/health.controller';

validateEnv();

const app = new App([/*AuthController, UsersController,*/ QueryController, ReportController, HealthController]);
app.listen();
