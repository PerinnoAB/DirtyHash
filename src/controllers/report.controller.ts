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
    summary: 'Report a fraud case',
    responses: {
      201: {
        description: 'Report submitted to DirtyHash',
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
      const category = ReportCategory[categoryAsString];
      if (!category) {
        return null;
      }
      const reportData = new CreateReportDto(reportString, category, otherCategory, url, abuser, description, name, email);
      // Write report to data without waiting for it to finish
      this.reportService.createReport(reportData);
      return true;
    } catch (error) {
      console.error('Error while creating report: ', error);
      return null;
    }
  }
}
