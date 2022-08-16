import { CreateReportDto } from '@/dtos/reports.dto';
import { ReportCategory } from '@/interfaces/report.interface';
import ReportService from '@/services/report.service';
import { BodyParam, Controller, HttpCode, OnNull, Post } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';

@Controller()
export class ReportController {
  public reportService = new ReportService();

  @Post('/report')
  @OpenAPI({
    summary: 'Report a fraud',
    responses: {
      201: {
        description: 'Report created',
      },
      400: {
        description: 'Bad request',
      },
    },
  })
  @HttpCode(201)
  @OnNull(400)
  async createReport(
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
      let category = ReportCategory[categoryAsString];
      if (!category) {
        return null;
      }
      let reportData = new CreateReportDto(reportString, category, otherCategory, url, abuser, description, name, email);
      return await this.reportService.createReport(reportData);
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
