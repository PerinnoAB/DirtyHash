import { validate } from 'multicoin-address-validator';
import FirestoreService from './firestore.service';

class QueryService {
  public firestoreService = new FirestoreService();

  public async queryString(stringQuery: string): Promise<any> {
    let queryCollection = 'unknown';

    if (validate(stringQuery, 'btc')) {
      queryCollection = 'btc';
    }
    if (validate(stringQuery, 'eth')) {
      queryCollection = 'eth';
    }

    let queryValue = await this.firestoreService.getDoc(queryCollection, stringQuery);
    if (queryValue.data()) {
      return { ...queryValue.data(), collection: queryCollection, id: queryValue.id };
    }
    return null;
  }
}

export default QueryService;
