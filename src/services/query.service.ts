import { validate } from 'multicoin-address-validator';
import validator from 'validator';
import FirestoreService from './firestore.service';
import VirustotalService from './virustotal.service';
import { getDomain } from 'tldts';

class QueryService {
  public firestoreService = new FirestoreService();
  public virustotalService = new VirustotalService();

  public async queryString(stringQuery: string): Promise<any> {
    let queryCollection = 'unknown';
    let analysisResult = 'caution';
    let analysisSafetyScore = 50;
    let analysisMethod = 'ML';
    let analysisSource = 'dirtyhash';
    let userComments = [];

    if (validate(stringQuery, 'btc')) {
      queryCollection = 'btc';
    } else if (validate(stringQuery, 'eth')) {
      queryCollection = 'eth';
    } else if (validate(stringQuery, 'sol')) {
      queryCollection = 'sol';
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
    } else if (stringQuery.startsWith('@')) {
      queryCollection = 'twitter';
    } else {
      const strDomain = getDomain(stringQuery);
      if (strDomain !== null) {
        queryCollection = 'domains';
        stringQuery = strDomain;
      }
    }

    // Search whitelists first
    let queryValue = await this.firestoreService.getDoc('wl-' + queryCollection, stringQuery);
    if (queryValue.data()) {
      analysisResult = 'safe';
      analysisSafetyScore = 0;
      analysisMethod = 'whitelist';
      userComments = await this.firestoreService.getUserComments('wl-' + queryCollection, stringQuery);
      this.firestoreService.updateDocStats('wl-' + queryCollection, stringQuery);
    } else {
      // then search blacklists
      queryValue = await this.firestoreService.getDoc(queryCollection, stringQuery);
      if (queryValue.data()) {
        analysisResult = 'fraud';
        analysisSafetyScore = 100;
        analysisMethod = 'blacklist';
        userComments = await this.firestoreService.getUserComments(queryCollection, stringQuery);
        this.firestoreService.updateDocStats(queryCollection, stringQuery);
      }
    }

    // If blacklist or whitelist is hit, then return the result
    const dhResult = queryValue.data();
    if (queryValue.data()) {
      if (!dhResult['source']) {
        dhResult['source'] = 'DirtyHash';
      }

      return {
        result: analysisResult,
        id: queryValue.id,
        collection: queryCollection,
        safetyScore: analysisSafetyScore,
        method: analysisMethod,
        ...dhResult,
        comments: userComments,
      };
    } else {
      // In case of domain that is not in our DB, query the Virustotal service
      if (queryCollection === 'domains') {
        console.log('Calling Virustotal for domain: ', stringQuery);
        const vtResult = await this.virustotalService.getVirustotalVerdict(stringQuery);
        analysisMethod = 'VirusTotal';
        analysisResult = vtResult['result'];
        analysisSource = vtResult['sources'];
      }

      // See if we have stats in 'searches' collection
      queryValue = await this.firestoreService.getDoc('searches', stringQuery);
      const dhResult = queryValue.data();

      this.firestoreService.updateDocStats('searches', stringQuery);
      // No blacklist or whitelist match, nor a domain
      return {
        result: analysisResult,
        id: queryValue.id,
        collection: queryCollection,
        source: analysisSource,
        reputationScore: analysisSafetyScore,
        method: analysisMethod,
        ...dhResult,
      };
    }
  }
}

export default QueryService;
