import App from '@/app';
import { AuthController } from '@controllers/auth.controller';
import { UsersController } from '@controllers/users.controller';
import { QueryController } from './controllers/query.controller';
import validateEnv from '@utils/validateEnv';
import { ReportController } from './controllers/report.controller';
import { HealthController } from './controllers/health.controller';

validateEnv();

const app = new App([AuthController, UsersController, QueryController, ReportController, HealthController]);
app.listen();
