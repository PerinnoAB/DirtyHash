import { Report, ReportCategory } from '@/interfaces/report.interface';

export class CreateReportDto implements Report {
  constructor(
    reportString: string,
    category: ReportCategory,
    otherCategory?: string,
    url?: string,
    abuser?: string,
    description?: string,
    name?: string,
    email?: string,
  ) {
    this.reportString = reportString;
    this.category = category;
    this.otherCategory = otherCategory;
    this.url = url;
    this.abuser = abuser;
    this.description = description;
    this.name = name;
    this.email = email;
  }

  reportString: string;
  category: ReportCategory;
  otherCategory?: string;
  url?: string;
  abuser?: string;
  description?: string;
  name?: string;
  email?: string;
}
