const axios = require('axios').default;

class VirustotalService {
  VT_URL = 'https://www.virustotal.com/api/v3/search';
  VT_API_KEY = '28b72c0ce2d0bf2f2c7350895b3b4423b9ee4b31ece41c369c570a202058fc5e';

  public async getVirustotalVerdict(searchString: string): Promise<any> {
    try {
      const resp = await axios.get(this.VT_URL, {
        params: { query: searchString },
        headers: {
          'x-apikey': this.VT_API_KEY,
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
