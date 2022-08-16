import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { DocumentSnapshot, getFirestore } from 'firebase-admin/firestore';

class FirestoreService {
  // Initialize Firebase
  app = initializeApp({
    credential: applicationDefault(),
  });

  db = getFirestore(this.app);

  public async getDoc(collectionName: string, docName: string): Promise<DocumentSnapshot> {
    return await this.db.collection(collectionName).doc(docName).get();
  }

  public async setDoc(collectionName: string, docName: string, payload: any) {
    return await this.db
      .collection(collectionName)
      .doc(docName)
      .set(JSON.parse(JSON.stringify(payload)));
  }
}

export default FirestoreService;
