import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { validate } from 'multicoin-address-validator';

class QueryService {
  // Initialize Firebase
  app = initializeApp({
    credential: applicationDefault(),
  });

  db = getFirestore(this.app);

  public async queryString(stringQuery: string): Promise<any> {
    let queryCollection = 'unknown';

    if (validate(stringQuery, 'btc')) {
      queryCollection = 'btc';
    }
    if (validate(stringQuery, 'eth')) {
      queryCollection = 'eth';
    }

    let queryValue = await this.db.collection(queryCollection).doc(stringQuery).get();
    return { ...queryValue.data(), collection: queryCollection, id: queryValue.id };
  }
}

export default QueryService;
