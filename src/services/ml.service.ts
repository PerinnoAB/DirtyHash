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

const axios = require('axios').default;
import { ML_SERVER } from '@config';

class MLService {
  ML_SERVER_URL_BTC = ML_SERVER + '/classify-btc';
  ML_SERVER_URL_ETH = ML_SERVER + '/classify-eth';

  public async getMLPredictionBTC(searchString: string): Promise<any> {
    try {
      const resp = await axios.get(this.ML_SERVER_URL_BTC, {
        params: { address: searchString },
      });

      if (resp.status === 200) {
        return resp.data;
      }
    } catch (err) {
      console.error('ERROR: Failed to call ML BTC API', err);
    }
    return null;
  }

  public async getMLPredictionETH(searchString: string): Promise<any> {
    try {
      const resp = await axios.get(this.ML_SERVER_URL_ETH, {
        params: { address: searchString },
      });

      if (resp.status === 200) {
        return resp.data;
      }
    } catch (err) {
      console.error('ERROR: Failed to call ML BTC API', err);
    }
    return null;
  }
}

export default MLService;
