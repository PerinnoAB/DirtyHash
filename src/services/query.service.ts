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
import { getDomain } from 'tldts';

class QueryService {
  public firestoreService = new FirestoreService();
  public virustotalService = new VirustotalService();
  public mlService = new MLService();

  private async getMLPrediction(address: string, chain: string): Promise<any> {
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

    return mlData;
  }

  public async queryString(stringQuery: string): Promise<any> {
    let overallAnalysisResult = 'unknown';
    let overallAnalysisRiskScore = 0;
    let blacklistResult = {};
    let relatedURLBlacklistResult = {};
    let whitelistResult = {};
    let txTracingResult = {};
    let levenshteinAnalysisResult = {};
    let mlAnalysisResult = {};
    let phishingMalwareAnalysisResult = {};
    let userComments = [];
    let searchStatsResult = {};

    let foundInWhitelist = false;
    let relatedURL = '';

    if (isEmpty(stringQuery)) {
      return null;
    }

    stringQuery = decodeURIComponent(stringQuery);
    console.log('Decoded search string: ', stringQuery);
    const [queryCollection, transformedString] = getCollection(stringQuery);
    console.log('Collection: ', queryCollection, ' Transformed-string: ', transformedString);

    // Search whitelists first
    let queryValue = await this.firestoreService.getDoc('wl-' + queryCollection, transformedString);
    if (queryValue.data()) {
      foundInWhitelist = true;
      overallAnalysisResult = 'safe';
      overallAnalysisRiskScore = 5;
      whitelistResult = {
        found: 'true',
        ...queryValue.data(),
      };
      relatedURL = whitelistResult['url'];
      userComments = await this.firestoreService.getUserComments('wl-' + queryCollection, transformedString);
    } else {
      // then search blacklists
      queryValue = await this.firestoreService.getDoc(queryCollection, transformedString);
      if (queryValue.data()) {
        overallAnalysisResult = 'fraud';
        overallAnalysisRiskScore = 95;
        blacklistResult = {
          found: 'true',
          ...queryValue.data(),
        };
        relatedURL = blacklistResult['url'];

        // check if related URL is in blacklist
        if (!isEmpty(relatedURL)) {
          const [, tURL] = getCollection(relatedURL);
          queryValue = await this.firestoreService.getDoc('domains', tURL);
          if (queryValue.data()) {
            overallAnalysisResult = 'fraud';
            overallAnalysisRiskScore = 95;
            relatedURLBlacklistResult = {
              found: 'true',
              ...queryValue.data(),
            };
          }
        }
        userComments = await this.firestoreService.getUserComments(queryCollection, transformedString);
      } else {
        // search greylists
        queryValue = await this.firestoreService.getDoc('gl-' + queryCollection, transformedString);
        if (queryValue.data()) {
          overallAnalysisResult = 'caution';
          overallAnalysisRiskScore = 70;
          txTracingResult = {
            found: 'true',
            ...queryValue.data(),
          };
        }
      }
    }

    // In case of domain OR is a related URL is found, query the Virustotal service
    if (queryCollection === 'domains') {
      console.log('Calling Virustotal for domain: ', transformedString);
      const vtResult = await this.virustotalService.getVirustotalVerdict(transformedString);

      if (vtResult !== null) {
        phishingMalwareAnalysisResult = {
          AnalyzedBy: 'VirusTotal',
          URL: transformedString,
          ...vtResult,
        };

        if (overallAnalysisResult === 'unknown') {
          overallAnalysisResult = vtResult['result'];
          overallAnalysisRiskScore = overallAnalysisResult === 'clean' ? 5 : 95;
        }
      }
    } else if (!isEmpty(relatedURL)) {
      const relatedDomain = getDomain(relatedURL);
      console.log('Calling Virustotal for domain: ', relatedDomain);
      const vtResult = await this.virustotalService.getVirustotalVerdict(relatedDomain);

      if (vtResult !== null) {
        phishingMalwareAnalysisResult = {
          AnalyzedBy: 'VirusTotal',
          URL: relatedDomain,
          ...vtResult,
        };
        overallAnalysisResult = overallAnalysisResult === 'unknown' ? vtResult['result'] : overallAnalysisResult;
        if (vtResult['result'] === 'malicious') {
          overallAnalysisRiskScore = 95;
        }
      }
    }

    // In case of twitter handle, query the twitter ML service
    if (queryCollection === 'twitter' && !foundInWhitelist) {
      const twitter_analysis = await this.mlService.getAnalysisTwitter(transformedString);
      if (!isEmpty(twitter_analysis)) {
        levenshteinAnalysisResult = {
          ...twitter_analysis,
        };

        const riskScore: number = +twitter_analysis['risk_score'];
        if (overallAnalysisResult === 'unknown' && riskScore > 30) {
          overallAnalysisResult = 'caution';
          // overwrite risk score only if ML indicates more than 30%
          overallAnalysisRiskScore = riskScore;
        }
      }
    }

    // for eth and btc, not in whitelist, call the ML service
    if (!foundInWhitelist) {
      if (queryCollection === 'btc' || queryCollection === 'eth') {
        const mlResult = await this.getMLPrediction(transformedString, queryCollection);
        if (!isEmpty(mlResult)) {
          mlAnalysisResult = mlResult;
          const riskScore: number = +mlResult['risk_score'];
          if (overallAnalysisResult === 'unknown') {
            overallAnalysisResult = 'caution';
            // overwrite risk score only if ML indicates more than 30%
            overallAnalysisRiskScore = riskScore;
          }
        }
      }
    }

    // See if we have stats in 'searches' collection
    queryValue = await this.firestoreService.getDoc('searches', transformedString);
    searchStatsResult = queryValue.data();
    this.firestoreService.updateDocStats('searches', transformedString);

    if (isEmpty(blacklistResult['source'])) {
      blacklistResult['source'] = 'DirtyHash';
    }

    // Return response
    const response = {
      SearchTerm: queryValue.id,
      Collection: queryCollection,
      OverallAssessmentResult: overallAnalysisResult,
      OverallAssessmentRiskScore: overallAnalysisRiskScore,
      RelatedURL: relatedURL,
      BlacklistSearchResult: blacklistResult,
      RelatedURLBlacklistResult: relatedURLBlacklistResult,
      TransactionTracingResult: txTracingResult,
      WhitelistSearchResult: whitelistResult,
      LevenshteinAnalysisResult: levenshteinAnalysisResult,
      MachineLearningAnalysisResult: mlAnalysisResult,
      PhishingMalwareAnalysisResult: phishingMalwareAnalysisResult,
      UserReports: userComments,
      SearchStats: searchStatsResult ? searchStatsResult : {},
    };
    console.log('Response: ', response);

    return response;
  }
}

export default QueryService;
