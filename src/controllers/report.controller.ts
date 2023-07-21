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

import { CreateReportDto } from '@/dtos/reports.dto';
import { ReportCategory } from '@/interfaces/report.interface';
import AuthService from '@/services/auth.service';
import ReportService from '@/services/report.service';
import { isEmpty } from '@/utils/util';
import { BodyParam, Controller, HttpCode, OnNull, OnUndefined, Post, HeaderParam } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

@Controller()
export class ReportController {
  public authService = new AuthService();

  @Post('/report')
  @OpenAPI({
    summary: 'Report a fraud case',
    responses: {
      201: {
        description: 'Report successfully submitted to DirtyHash™',
      },
      400: {
        description: 'Bad request',
      },
      401: {
        description: 'Unauthorized, invalid or missing auth token',
      },
    },
  })
  @HttpCode(201)
  @OnNull(400)
  @OnUndefined(401)
  async createReport(
    @HeaderParam('Authorization') authToken: string,
    @BodyParam('reportString', { required: true }) reportString: string,
    @BodyParam('category', { required: true }) categoryAsString: string,
    @BodyParam('otherCategory') otherCategory?: string,
    @BodyParam('url') url?: string,
    @BodyParam('abuser') abuser?: string,
    @BodyParam('description') description?: string,
    @BodyParam('name') name?: string,
    @BodyParam('email') email?: string,
  ) {
    try {
      const category = ReportCategory[categoryAsString];
      if (!category) {
        return null;
      }

      const result = await this.authService.logUserReport(authToken, reportString, category, otherCategory, url, abuser, description, name, email);
      return result == false ? undefined : true;
    } catch (error) {
      console.error('Error while creating report: ', error);
      return null;
    }
  }
}
