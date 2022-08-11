import App from '@/app';
import { AuthController } from '@controllers/auth.controller';
import { UsersController } from '@controllers/users.controller';
import { QueryController } from './controllers/query.controller';
import validateEnv from '@utils/validateEnv';

validateEnv();

const app = new App([AuthController, UsersController, QueryController]);
app.listen();
