import { Controller, Get } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

@Controller()
export class HealthController {
  @Get('/heartbeat')
  @OpenAPI({ summary: 'Return true if app is alive' })
  async isAlive() {
    return true;
  }
}
