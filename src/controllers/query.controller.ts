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
import { Controller, Get, OnNull, OnUndefined, Param, HeaderParam, Post, HttpCode, BodyParam } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { getAllChainsForAddress, isEmpty } from '../utils/util';

@Controller()
export class QueryController {
  public queryService = new QueryService();
  public authService = new AuthService();

  @Get('/query/:query')
  @OpenAPI({
    summary: 'Returns the result of fraud detection analysis',
    description:
      '### Note: You can call this API without the x-apikey header, but in that case your requests will be throttled.\nStatus codes: \n* 200 OK Success \n* 204 Internal server error \n* 409 Too many requests without x-apikey header \n* 403 API key is invalid or your request quota has been exhausted',
  })
  @OnNull(204)
  @OnUndefined(403)
  async queryString(@Param('query') query: string, @HeaderParam('x-apikey') apiKey: string, @HeaderParam('Authorization') authToken: string) {
    const shouldServe = await this.authService.shouldServeRequest(apiKey, authToken, query);
    if (shouldServe) {
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

  @Get('/search-credits')
  @OpenAPI({
    summary: 'Returns the number of remaining search credits for a particular user',
  })
  async getSearchCredits(@HeaderParam('Authorization') authToken: string) {
    const searchCredits = await this.authService.getSearchCredits(authToken);
    const response = { SearchCredits: searchCredits };
    return response;
  }

  @Get('/chains/:address')
  @OpenAPI({
    summary: 'Returns all crypto chains to which this address belongs',
  })
  @OnNull(204)
  async getChainsForAddress(@Param('address') address: string) {
    if (!isEmpty(address)) {
      return JSON.stringify(getAllChainsForAddress(address));
    }
    return null;
  }

  @Post('/track-wallet')
  @OpenAPI({
    summary: 'Track a Wallet Address and receive email notifications',
    responses: {
      201: {
        description: 'Successfully subscribed to track wallet address',
      },
      400: {
        description: 'Auth header is missing in the request',
      },
    },
  })
  @HttpCode(201)
  @OnNull(400)
  @OnUndefined(403)
  async trackWallet(
    @HeaderParam('Authorization') authToken: string,
    @BodyParam('address', { required: true }) address: string,
    @BodyParam('chain', { required: true }) chain: string,
  ) {
    let result = undefined;
    // Return bad request if any auth is empty
    if (isEmpty(authToken)) return null;

    if (chain === 'btc' || chain === 'eth') result = await this.authService.trackWallet(authToken, address, chain);

    return result;
  }

  @Post('/stop-track-wallet')
  @OpenAPI({
    summary: 'Stop tracking a Wallet Address',
    responses: {
      201: {
        description: 'Successfully stopped tracking wallet address',
      },
      400: {
        description: 'Auth header is missing in the request',
      },
    },
  })
  @HttpCode(201)
  @OnNull(400)
  @OnUndefined(403)
  async stopTrackWallet(
    @HeaderParam('Authorization') authToken: string,
    @BodyParam('address', { required: true }) address: string,
    @BodyParam('chain', { required: true }) chain: string,
  ) {
    let result = undefined;
    // Return bad request if any auth is empty
    if (isEmpty(authToken)) return null;

    if (chain === 'btc' || chain === 'eth') result = await this.authService.stopTrackWallet(authToken, address, chain);

    return result;
  }

  @Post('/status-track-wallet')
  @OpenAPI({
    summary: 'Track status of a Wallet Address for a particular user',
    responses: {
      201: {
        description: 'Success',
      },
      400: {
        description: 'Auth header is missing in the request',
      },
    },
  })
  @HttpCode(201)
  @OnNull(400)
  @OnUndefined(403)
  async statusTrackWallet(
    @HeaderParam('Authorization') authToken: string,
    @BodyParam('address', { required: true }) address: string,
    @BodyParam('chain', { required: true }) chain: string,
  ) {
    let result = undefined;
    // Return bad request if any auth is empty
    if (isEmpty(authToken)) return null;

    if (chain === 'btc' || chain === 'eth') result = await this.authService.statusTrackWallet(authToken, address, chain);
    return result;
  }
}
