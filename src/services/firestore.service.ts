/* Copyright 2022 Perinno AB. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

import { applicationDefault, initializeApp, getApps, getApp } from 'firebase-admin/app';
import { DocumentSnapshot, FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

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

  public async decodeAuthToken(authToken: string): Promise<any> {
    const decodedToken = await getAuth(this.app).verifyIdToken(authToken);
    return decodedToken;
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

  public async getAPIKeyRemainingQuota(apiKey: string): Promise<number> {
    let remainingQuota = 0;
    const docRef = this.db.collection('api-keys').doc(apiKey);
    const doc = await docRef.get();
    if (doc.exists) {
      const email = doc.data().email;
      remainingQuota = await this.getUserRemainingQuota(email);
    }
    return remainingQuota;
  }

  public async getUserRemainingQuota(email: string): Promise<number> {
    let remainingQuota = 0;
    const docRef = this.db.collection('users').doc(email);
    const doc = await docRef.get();
    if (doc.exists) {
      remainingQuota = doc.data().RemainingQuota;
      if (remainingQuota > 0) {
        const res = await docRef.update({
          RemainingQuota: FieldValue.increment(-1),
        });
      }
    } else {
      console.log('Email not found, setting default quota for: ', email);
      remainingQuota = 5;
      await docRef.set({
        RemainingQuota: remainingQuota,
      });
    }
    return remainingQuota;
  }
}

export default FirestoreService;
