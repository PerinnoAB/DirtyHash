import { Report } from '@/interfaces/report.interface';
import FirestoreService from './firestore.service';

class ReportService {
  public firestoreService = new FirestoreService();
  reportsCollectionName = 'reports';

  public async createReport(payload: Report): Promise<any> {
    return this.firestoreService.addDoc(this.reportsCollectionName, payload);
  }
}

export default ReportService;
