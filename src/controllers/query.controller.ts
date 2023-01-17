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

import QueryService from '@/services/query.service';
import AuthService from '@/services/auth.service';
import { Controller, Get, OnNull, OnUndefined, Param, HeaderParam } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

@Controller()
export class QueryController {
  public queryService = new QueryService();
  public authService = new AuthService();

  @Get('/query/:query')
  @OpenAPI({ summary: 'Return the result of fraud detection analysis' })
  @OnNull(204)
  @OnUndefined(403)
  async queryString(@Param('query') query: string, @HeaderParam('x-apikey') apiKey: string) {
    const apiKeyIsValid = await this.authService.isAPIKeyValid(apiKey);
    if (apiKeyIsValid) {
      const queryResult = await this.queryService.queryString(query);
      if (queryResult) {
        return queryResult;
      }
      return null;
    } else {
      // if api key is invalid, return undefined which will translate to unauthenticated status code
      return undefined;
    }
  }
}
