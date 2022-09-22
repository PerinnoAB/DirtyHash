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

import FirestoreService from './firestore.service';
import VirustotalService from './virustotal.service';
import MLService from './ml.service';
import { getCollection, isEmpty } from '../utils/util';

class QueryService {
  public firestoreService = new FirestoreService();
  public virustotalService = new VirustotalService();
  public mlService = new MLService();

  private async getMLPrediction(address: string, chain: string): Promise<[string, number, string, any]> {
    let analysisResult = 'unknown';
    let analysisRiskScore = 0;
    let analysisMethod = '--';
    let mlData = {};

    switch (chain) {
      case 'btc':
        mlData = await this.mlService.getMLPredictionBTC(address);
        break;
      case 'eth':
        mlData = await this.mlService.getMLPredictionETH(address);
        break;
      default:
        break;
    }

    if (!isEmpty(mlData)) {
      if (mlData['is_fraud'] === '-1') {
        analysisResult = 'new';
        analysisRiskScore = 0;
      } else {
        analysisResult = 'caution';
        analysisRiskScore = mlData['risk_score'];
        analysisMethod = 'Machine Learning';
      }
    }

    return [analysisResult, analysisRiskScore, analysisMethod, mlData];
  }

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

    stringQuery = decodeURIComponent(stringQuery);
    const [queryCollection, transformedString] = getCollection(stringQuery);
    console.log('Collection: ', queryCollection, ' Transformed-string: ', transformedString);

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

        // for blacklisted eth and btc, additionally call ML service
        if (queryCollection === 'btc' || queryCollection === 'eth') {
          // also call ML service
          const [, analysisRiskScoreML, analysisMethodML, mlDataML] = await this.getMLPrediction(transformedString, queryCollection);
          mlData = mlDataML;
          analysisMethod += ' | ' + analysisMethodML;
          // overwrite risk score only if ML indicates more than 10%
          analysisRiskScore = analysisRiskScoreML > 10 ? analysisRiskScoreML : analysisRiskScore;
        }
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
      }
      // else analyze with ML service
      else {
        [analysisResult, analysisRiskScore, analysisMethod, mlData] = await this.getMLPrediction(transformedString, queryCollection);
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
