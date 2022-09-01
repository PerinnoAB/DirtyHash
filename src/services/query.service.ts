import { validate } from 'multicoin-address-validator';
import validator from 'validator';
import FirestoreService from './firestore.service';
import VirustotalService from './virustotal.service';
import { getDomain } from 'tldts';
import MLService from './ml.service';

class QueryService {
  public firestoreService = new FirestoreService();
  public virustotalService = new VirustotalService();
  public mlService = new MLService();

  public async queryString(stringQuery: string): Promise<any> {
    let queryCollection = 'unknown';
    let analysisResult = 'unknown';
    let analysisRiskScore = 95;
    let analysisMethod = '--';
    let analysisSource = 'DirtyHash';
    let dhResult = {};
    let mlData = {};
    let userComments = [];

    if (validate(stringQuery, 'btc')) {
      queryCollection = 'btc';
      mlData = await this.mlService.getMLPredictionBTC(stringQuery);

      if (mlData !== null) {
        analysisResult = mlData['is_fraud'] === '1' ? 'fraud' : 'safe';
        analysisRiskScore = mlData['risk_score'];
        if (mlData['risk_score']) {
          analysisMethod = 'Machine Learning';
        }
      }
    } else if (validate(stringQuery, 'eth')) {
      queryCollection = 'eth';
    } else if (validate(stringQuery, 'sol')) {
      queryCollection = 'sol';
    } else if (validate(stringQuery, 'eos')) {
      queryCollection = 'eos';
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
      analysisRiskScore = 5;
      analysisMethod = 'whitelist';
      userComments = await this.firestoreService.getUserComments('wl-' + queryCollection, stringQuery);
      this.firestoreService.updateDocStats('wl-' + queryCollection, stringQuery);
    } else {
      // then search blacklists
      queryValue = await this.firestoreService.getDoc(queryCollection, stringQuery);
      if (queryValue.data()) {
        analysisResult = 'fraud';
        analysisRiskScore = 95;
        analysisMethod = 'blacklist';
        userComments = await this.firestoreService.getUserComments(queryCollection, stringQuery);
        this.firestoreService.updateDocStats(queryCollection, stringQuery);
      }
    }

    dhResult = queryValue.data();

    // if no blacklist or whitelist was hit, then try Virustotal on domain
    if (!dhResult) {
      // In case of domain that is not in our DB, query the Virustotal service
      if (queryCollection === 'domains') {
        console.log('Calling Virustotal for domain: ', stringQuery);
        const vtResult = await this.virustotalService.getVirustotalVerdict(stringQuery);
        analysisMethod = 'VirusTotal';
        analysisResult = vtResult['result'];
        analysisRiskScore = analysisResult == 'safe' ? 5 : 95;
        analysisSource = vtResult['sources'];
      }

      // See if we have stats in 'searches' collection
      queryValue = await this.firestoreService.getDoc('searches', stringQuery);
      dhResult = queryValue.data();

      this.firestoreService.updateDocStats('searches', stringQuery);
    }

    if (dhResult && !dhResult['source']) {
      dhResult['source'] = analysisSource;
    }

    // Return response
    return {
      id: queryValue.id,
      result: analysisResult,
      collection: queryCollection,
      riskScore: analysisRiskScore,
      method: analysisMethod,
      ...dhResult,
      mlResult: mlData,
      comments: userComments,
    };
  }
}

export default QueryService;
