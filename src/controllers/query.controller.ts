import QueryService from '@/services/query.service';
import { Controller, Get, OnNull, OnUndefined, Param } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

@Controller()
export class QueryController {
  public queryService = new QueryService();

  @Get('/query/:query')
  @OpenAPI({ summary: 'Return the result of fraud detection analysis' })
  @OnNull(204)
  async queryString(@Param('query') query: string) {
    const queryResult = await this.queryService.queryString(query);
    if (queryResult) {
      return queryResult;
    }
    return null;
  }
}
