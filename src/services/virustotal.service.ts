const axios = require('axios').default;

class VirustotalService {
  VT_URL = 'https://www.virustotal.com/api/v3/search';
  VT_API_KEY = '28b72c0ce2d0bf2f2c7350895b3b4423b9ee4b31ece41c369c570a202058fc5e';

  public async getVirustotalVerdict(searchString: string): Promise<string> {
    try {
      const resp = await axios.get(this.VT_URL, {
        params: { query: searchString },
        headers: {
          'x-apikey': this.VT_API_KEY,
        },
      });

      if (resp.status === 200) {
        const numHarmless = resp.data.data[0].attributes.last_analysis_stats.harmless;
        const numMalicious = resp.data.data[0].attributes.last_analysis_stats.malicious;
        const numSuspicious = resp.data.data[0].attributes.last_analysis_stats.suspicious;

        if (numHarmless > 0 && numMalicious === 0 && numSuspicious === 0) {
          return 'safe';
        } else if (numHarmless === 0 && numMalicious === 0 && numSuspicious === 0) {
          return 'caution';
        } else {
          return 'fraud';
        }
      }
    } catch (err) {
      console.error('ERROR: Failed to call Virustotal API', err);
    }
    return null;
  }
}

export default VirustotalService;
