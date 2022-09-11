import FirestoreService from './firestore.service';
import VirustotalService from './virustotal.service';
import MLService from './ml.service';
import { getCollection, isEmpty } from '../utils/util';

class QueryService {
  public firestoreService = new FirestoreService();
  public virustotalService = new VirustotalService();
  public mlService = new MLService();

  public async queryString(stringQuery: string): Promise<any> {
    let analysisResult = 'unknown';
    let analysisRiskScore = 0;
    let analysisMethod = '--';
    let analysisSource = 'DirtyHash';
    let dhResult = {};
    let mlData = {};
    let userComments = [];

    if (isEmpty(stringQuery)) {
      return null;
    }

    const [queryCollection, transformedString] = getCollection(stringQuery);

    // Search whitelists first
    let queryValue = await this.firestoreService.getDoc('wl-' + queryCollection, transformedString);
    if (queryValue.data()) {
      analysisResult = 'safe';
      analysisRiskScore = 5;
      analysisMethod = 'whitelist';
      userComments = await this.firestoreService.getUserComments('wl-' + queryCollection, transformedString);
      this.firestoreService.updateDocStats('wl-' + queryCollection, transformedString);
    } else {
      // then search blacklists
      queryValue = await this.firestoreService.getDoc(queryCollection, transformedString);
      if (queryValue.data()) {
        analysisResult = 'fraud';
        analysisRiskScore = 95;
        analysisMethod = 'blacklist';
        userComments = await this.firestoreService.getUserComments(queryCollection, transformedString);
        this.firestoreService.updateDocStats(queryCollection, transformedString);
      }
    }

    dhResult = queryValue.data();

    // if no blacklist or whitelist was hit, then try Virustotal on domain and ML on btc
    if (!dhResult) {
      // In case of domain that is not in our DB, query the Virustotal service
      if (queryCollection === 'domains') {
        console.log('Calling Virustotal for domain: ', transformedString);
        const vtResult = await this.virustotalService.getVirustotalVerdict(transformedString);

        if (vtResult !== null) {
          analysisMethod = 'VirusTotal';
          analysisResult = vtResult['result'];
          analysisRiskScore = analysisResult == 'safe' ? 5 : 95;
          analysisSource = vtResult['sources'];
        }
      } else if (queryCollection === 'btc') {
        mlData = await this.mlService.getMLPredictionBTC(transformedString);

        if (mlData !== null) {
          if (mlData['is_fraud'] === '-1') {
            analysisResult = 'new';
            analysisRiskScore = 0;
          } else {
            //analysisResult = mlData['is_fraud'] === '1' ? 'fraud' : 'safe';
            analysisResult = 'caution';
            analysisRiskScore = mlData['risk_score'];
            analysisMethod = 'Machine Learning';
          }
        }
      } else if (queryCollection === 'eth') {
        mlData = await this.mlService.getMLPredictionETH(transformedString);

        if (mlData !== null) {
          if (mlData['is_fraud'] === '-1') {
            analysisResult = 'new';
            analysisRiskScore = 0;
          } else {
            //analysisResult = mlData['is_fraud'] === '1' ? 'fraud' : 'safe';
            analysisResult = 'caution';
            analysisRiskScore = mlData['risk_score'];
            analysisMethod = 'Machine Learning';
          }
        }
      } else {
        //this case is for a search string that we don't support
        analysisResult = 'unknown';
      }

      // See if we have stats in 'searches' collection
      queryValue = await this.firestoreService.getDoc('searches', transformedString);
      dhResult = queryValue.data();

      this.firestoreService.updateDocStats('searches', transformedString);
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
