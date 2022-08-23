import { validate } from 'multicoin-address-validator';
import validator from 'validator';
import extractDomain from 'extract-domain';
import FirestoreService from './firestore.service';

class QueryService {
  public firestoreService = new FirestoreService();

  public async queryString(stringQuery: string): Promise<any> {
    let queryCollection = 'unknown';
    let analysisResult = 'caution';
    let analysisSafetyScore = 50;
    let analysisMethod = 'ML';

    if (validate(stringQuery, 'btc')) {
      queryCollection = 'btc';
    } else if (validate(stringQuery, 'eth')) {
      queryCollection = 'eth';
    } else if (validator.isEmail(stringQuery)) {
      queryCollection = 'email';
      stringQuery = validator.normalizeEmail(stringQuery, {
        all_lowercase: true,
        gmail_lowercase: true,
        gmail_remove_dots: true,
        gmail_remove_subaddress: true,
        gmail_convert_googlemaildotcom: true,
        outlookdotcom_lowercase: true,
        outlookdotcom_remove_subaddress: true,
        yahoo_lowercase: true,
        yahoo_remove_subaddress: true,
        icloud_lowercase: true,
        icloud_remove_subaddress: true,
      });
      console.log('Email: {0}', stringQuery);
    } else if (validator.isURL(stringQuery)) {
      queryCollection = 'domains';
      stringQuery = extractDomain(stringQuery);
      console.log('Domain: {0}', stringQuery);
    } else if (stringQuery.startsWith('@')) {
      queryCollection = 'twitter';
      console.log('Twitter: {0}', stringQuery);
    }

    console.log('Coll: {0}, Query: {1}', queryCollection, stringQuery);
    // Search blacklists first
    let queryValue = await this.firestoreService.getDoc(queryCollection, stringQuery);
    if (queryValue.data()) {
      analysisResult = 'fraud';
      analysisSafetyScore = 0;
      analysisMethod = 'blacklist';
    } else {
      // then search whitelists
      console.log('Firebase alternate colelction: {0}', 'wl-' + queryCollection);
      queryValue = await this.firestoreService.getDoc('wl-' + queryCollection, stringQuery);
      if (queryValue.data()) {
        analysisResult = 'safe';
        analysisSafetyScore = 100;
        analysisMethod = 'whitelist';
      }
    }

    const dhResult = queryValue.data();
    if (queryValue.data()) {
      if (!dhResult['source']) {
        dhResult['source'] = 'dirtyhash';
      }
      return {
        result: analysisResult,
        id: queryValue.id,
        collection: queryCollection,
        safetyScore: analysisSafetyScore,
        method: analysisMethod,
        ...dhResult,
      };
    }
    return {
      result: analysisResult,
      id: queryValue.id,
      collection: queryCollection,
      reputationScore: analysisSafetyScore,
      method: analysisMethod,
    };
  }
}

export default QueryService;
