import { Report } from '@/interfaces/report.interface';
import FirestoreService from './firestore.service';

class ReportService {
  public firestoreService = new FirestoreService();
  reportsCollectionName = 'reports';

  public async createReport(payload: Report): Promise<any> {
    return this.firestoreService.setDoc(this.reportsCollectionName, payload.reportString, payload);
  }
}

export default ReportService;
