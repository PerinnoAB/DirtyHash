import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { DocumentSnapshot, FieldValue, getFirestore } from 'firebase-admin/firestore';

class FirestoreService {
  // Initialize Firebase
  app = initializeApp({
    credential: applicationDefault(),
  });

  db = getFirestore(this.app);

  public async getDoc(collectionName: string, docName: string): Promise<DocumentSnapshot> {
    return await this.db.collection(collectionName).doc(docName).get();
  }

  public async getUserComments(collectionName: string, docName: string): Promise<any[]> {
    const userComments = [];
    const userCommentDocs = await this.db.collection(collectionName).doc(docName).collection('user-comments').get();
    userCommentDocs.forEach(doc => {
      userComments.push(doc.data());
    });
    return userComments;
  }

  public async updateDocStats(collectionName: string, docName: string) {
    const dbRef = this.db.collection(collectionName).doc(docName);
    await dbRef.set({ 'times-searched': FieldValue.increment(1), 'last-searched': FieldValue.serverTimestamp() }, { merge: true });
  }

  public async setDoc(collectionName: string, docName: string, payload: any): Promise<FirebaseFirestore.WriteResult> {
    return await this.db
      .collection(collectionName)
      .doc(docName)
      .set(JSON.parse(JSON.stringify(payload)));
  }

  public async addDoc(collectionName: string, payload: any) {
    payload['timestamp'] = new Date().getTime();
    await this.db.collection(collectionName).add(JSON.parse(JSON.stringify(payload)));
  }
}

export default FirestoreService;
