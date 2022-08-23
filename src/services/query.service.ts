import { validate } from 'multicoin-address-validator';
import validator from 'validator';
import extractDomain from 'extract-domain';
import FirestoreService from './firestore.service';
import VirustotalService from './virustotal.service';

class QueryService {
  public firestoreService = new FirestoreService();
  public virustotalService = new VirustotalService();

  public async queryString(stringQuery: string): Promise<any> {
    let queryCollection = 'unknown';
    let analysisResult = 'caution';
    let analysisSafetyScore = 50;
    let analysisMethod = 'ML';
    let analysisSource = 'dirtyhash';

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
    } else if (validator.isURL(stringQuery)) {
      queryCollection = 'domains';
      stringQuery = extractDomain(stringQuery);
    } else if (stringQuery.startsWith('@')) {
      queryCollection = 'twitter';
    }

    // Search blacklists first
    let queryValue = await this.firestoreService.getDoc(queryCollection, stringQuery);
    if (queryValue.data()) {
      analysisResult = 'fraud';
      analysisSafetyScore = 0;
      analysisMethod = 'blacklist';
    } else {
      // then search whitelists
      queryValue = await this.firestoreService.getDoc('wl-' + queryCollection, stringQuery);
      if (queryValue.data()) {
        analysisResult = 'safe';
        analysisSafetyScore = 100;
        analysisMethod = 'whitelist';
      }
    }

    // If blacklist or whitelist is hit, then return the result
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
    } else {
      // In case of domain that is not in our DB, query the Virustotal service
      if (queryCollection === 'domains') {
        console.log('Calling Virustotal for domain: ', stringQuery);
        analysisResult = await this.virustotalService.getVirustotalVerdict(stringQuery);
        analysisMethod = 'VirusTotal';
        analysisSource = 'VirusTotal';
      }
    }

    // No blacklist or whitelist match, nor a domain
    return {
      result: analysisResult,
      id: queryValue.id,
      collection: queryCollection,
      source: analysisSource,
      reputationScore: analysisSafetyScore,
      method: analysisMethod,
    };
  }
}

export default QueryService;
