import { Controller, Get } from 'routing-controllers';
//import { OpenAPI } from 'routing-controllers-openapi';

@Controller()
export class HealthController {
  //@Get('/heartbeat')
  //@OpenAPI({ summary: 'Returns true if the DirtyHash service is running' })
  async isAlive() {
    return true;
  }
}
