import { Report } from '@/interfaces/report.interface';
import FirestoreService from './firestore.service';

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');

class ReportService {
  public firestoreService = new FirestoreService();
  reportsCollectionName = 'reports';

  public async createReport(payload: Report): Promise<any> {
    const msg = {
      to: 'amitv@perinno.com', // Change to your recipient
      from: 'contact@perinno.com', // Change to your verified sender
      subject: 'New user report: ' + payload.reportString,
      text: 'report',
      html:
        '<p>' +
        payload.abuser +
        ' ' +
        payload.category +
        ' ' +
        payload.description +
        ' ' +
        payload.email +
        ' ' +
        payload.name +
        ' ' +
        payload.otherCategory +
        ' ' +
        payload.url +
        '</p>',
    };
    sgMail
      .send(msg)
      .then(() => {
        // console.log('Email sent');
      })
      .catch(error => {
        console.error('Error sending report email', error);
      });

    return this.firestoreService.addDoc(this.reportsCollectionName, payload);
  }
}

export default ReportService;
