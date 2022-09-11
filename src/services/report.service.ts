import { Report } from '@/interfaces/report.interface';
import FirestoreService from './firestore.service';

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');

class ReportService {
  public firestoreService = new FirestoreService();
  reportsCollectionName = 'reports';

  public async createReport(payload: Report): Promise<any> {
    // send email to DH Ops team
    const msg = {
      to: 'contact@perinno.com', // Change to your recipient
      from: 'contact@perinno.com', // Change to your verified sender
      subject: 'New user report: ' + payload.reportString,
      text: 'report',
      html:
        '<p>Abuser: ' +
        payload.abuser +
        '</p><p>Category: ' +
        payload.category +
        ' </p><p>Description: ' +
        payload.description +
        ' </p><p>Email: ' +
        payload.email +
        ' </p><p>Name: ' +
        payload.name +
        ' </p><p>Other: ' +
        payload.otherCategory +
        ' </p><p>Url: ' +
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

    // Check the string reported and act to the relevant collections
    if (payload.reportString !== null) {
    }

    // If report contains URL
    if (payload.url !== null) {
    }

    // If report abuser details
    if (payload.abuser !== null) {
    }

    return this.firestoreService.addDoc(this.reportsCollectionName, payload);
  }
}

export default ReportService;
