import { Report } from '@/interfaces/report.interface';
import { getCollection, isEmpty } from '@/utils/util';
import FirestoreService from './firestore.service';
import validator from 'validator';

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
    if (!isEmpty(payload.reportString)) {
      this.reportEntity(payload.reportString, payload);
    }

    // If report contains URL
    if (!isEmpty(payload.url) && payload.reportString !== payload.url) {
      this.reportEntity(payload.url, payload);
    }

    // If report abuser details
    if (!isEmpty(payload.abuser)) {
      if (validator.isEmail(payload.abuser) || payload.abuser.startsWith('@') || payload.abuser.endsWith('.eth')) {
        this.reportEntity(payload.abuser, payload);
      }
    }

    return this.firestoreService.addDoc(this.reportsCollectionName, payload);
  }

  private reportEntity(entity: string, payload: Report) {
    entity = entity.trim();
    const [queryCollection, transformedString] = getCollection(entity);
    const doc = this.firestoreService.getDoc(queryCollection, transformedString);

    const comment = {
      timestamp: new Date().getTime(),
      comment: payload.description,
      name: payload.name,
      email: payload.email,
    };
    const reportData = {};
    // user reports will always be incremented
    reportData['first-reported'] = new Date().getTime();
    reportData['category'] = payload.category;
    reportData['source'] = 'DirtyHash';

    if (!isEmpty(payload.abuser)) {
      reportData['abuser'] = payload.abuser;
    }
    if (!isEmpty(payload.url)) {
      reportData['url'] = payload.url;
    }

    // if this already exists in DB
    if (!isEmpty(doc)) {
      // add description to user comments collection
      this.firestoreService.addUserComment(queryCollection, transformedString, comment);
    } else {
      this.firestoreService.setDoc(queryCollection, transformedString, reportData);
      this.firestoreService.addUserComment(queryCollection, transformedString, comment);
    }

    this.firestoreService.updateReports(queryCollection, transformedString);
  }
}

export default ReportService;
