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

import { VT_API_KEY, VT_URL } from '@config';
const axios = require('axios').default;

class VirustotalService {
  public async getVirustotalVerdict(searchString: string): Promise<any> {
    try {
      const resp = await axios.get(VT_URL, {
        params: { query: searchString },
        headers: {
          'x-apikey': VT_API_KEY,
        },
      });

      if (
        resp.status === 200 &&
        resp.data &&
        resp.data.data[0] &&
        typeof resp.data.data[0].attributes !== 'undefined' &&
        resp.data.data[0].attributes
      ) {
        const numHarmless = resp.data.data[0].attributes.last_analysis_stats.harmless;
        const numMalicious = resp.data.data[0].attributes.last_analysis_stats.malicious;
        const numSuspicious = resp.data.data[0].attributes.last_analysis_stats.suspicious;

        if (numHarmless > 0 && numMalicious === 0 && numSuspicious === 0) {
          return { result: 'safe', sources: 'VirusTotal Engines' };
        } else if (numHarmless === 0 && numMalicious === 0 && numSuspicious === 0) {
          return { result: 'caution', sources: '' };
        } else {
          const tresult = 'fraud';
          let tsources = '';
          const evals = resp.data.data[0].attributes.last_analysis_results;
          Object.entries(evals).forEach(([key, value]) => {
            if (value['category'] === 'malicious') {
              tsources = tsources === '' ? tsources + value['engine_name'] : tsources + ', ' + value['engine_name'];
            }
          });
          return { result: tresult, sources: tsources };
        }
      }
    } catch (err) {
      console.error('ERROR: Failed to call Virustotal API', err);
    }
    return null;
  }
}

export default VirustotalService;
