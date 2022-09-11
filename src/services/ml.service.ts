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
