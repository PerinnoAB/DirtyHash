import QueryService from '@/services/query.service';
import { Controller, Get, Param } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

@Controller()
export class QueryController {
  public queryService = new QueryService();

  @Get('/query/:query')
  @OpenAPI({ summary: 'Return the result of querying the database' })
  async queryString(@Param('query') query: string) {
    const queryResult = await this.queryService.queryString(query);
    return { data: queryResult, message: 'queryString' };
  }
}
