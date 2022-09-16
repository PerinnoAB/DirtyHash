import { applicationDefault, initializeApp, getApps, getApp } from 'firebase-admin/app';
import { DocumentSnapshot, FieldValue, getFirestore } from 'firebase-admin/firestore';

class FirestoreService {
  // Initialize Firebase
  app = !getApps().length
    ? initializeApp({
        credential: applicationDefault(),
      })
    : getApp();

  db = getFirestore(this.app);

  public async getDoc(collectionName: string, docName: string): Promise<DocumentSnapshot> {
    return await this.db.collection(collectionName).doc(docName).get();
  }

  public async getUserComments(collectionName: string, docName: string): Promise<any[]> {
    const userComments = [];
    const userCommentDocs = await this.db
      .collection(collectionName)
      .doc(docName)
      .collection('user-comments')
      .orderBy('timestamp', 'desc')
      .limit(5)
      .get();
    userCommentDocs.forEach(doc => {
      const doc_data = doc.data();
      delete doc_data['email'];
      userComments.push(doc_data);
    });
    return userComments;
  }

  public async addUserComment(collectionName: string, docName: string, userComment: any) {
    await this.db.collection(collectionName).doc(docName).collection('user-comments').add(userComment);
  }

  public async updateDocStats(collectionName: string, docName: string) {
    const dbRef = this.db.collection(collectionName).doc(docName);
    await dbRef.set({ 'times-searched': FieldValue.increment(1), 'last-searched': FieldValue.serverTimestamp() }, { merge: true });
  }

  public async updateReports(collectionName: string, docName: string) {
    const dbRef = this.db.collection(collectionName).doc(docName);
    await dbRef.set({ 'user-reports': FieldValue.increment(1) }, { merge: true });
  }

  public async setDoc(collectionName: string, docName: string, payload: any): Promise<FirebaseFirestore.WriteResult> {
    return await this.db
      .collection(collectionName)
      .doc(docName)
      .set(JSON.parse(JSON.stringify(payload)), { merge: true });
  }

  public async addDoc(collectionName: string, payload: any) {
    payload['timestamp'] = new Date().getTime();
    await this.db.collection(collectionName).add(JSON.parse(JSON.stringify(payload)));
  }
}

export default FirestoreService;
