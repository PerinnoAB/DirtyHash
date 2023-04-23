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

import { validate } from 'multicoin-address-validator';
import validator from 'validator';
import { getDomain, parse } from 'tldts';
const url_parse = require('url-parse');

/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
export const isEmpty = (value: string | number | object): boolean => {
  if (value === null) {
    return true;
  } else if (typeof value !== 'number' && value === '') {
    return true;
  } else if (typeof value === 'undefined' || value === undefined) {
    return true;
  } else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
    return true;
  } else {
    return false;
  }
};

/**
 * @method getCollection
 * @param {String} searchString
 * @returns {String, String} collectionName, transformedString
 * @description parses a string to obtain the database collection, string should already be checked with isEmpty()
 */
export const getCollection = (searchString: string): [string, string] => {
  let collectionName = 'unknown';
  let transformedString = searchString;

  if (validate(searchString, 'btc')) {
    collectionName = 'btc';
  } else if (validate(searchString, 'eth')) {
    // eth is case insensitive
    collectionName = 'eth';
    transformedString = searchString.toLowerCase();
  } else if (validate(searchString, 'sol')) {
    collectionName = 'sol';
  } else if (validate(searchString, 'trx')) {
    collectionName = 'trx';
  } else if (validate(searchString, 'bnb')) {
    collectionName = 'bnb';
  } else if (validate(searchString, 'dot')) {
    // dot is case sensitive
    collectionName = 'dot';
  } else if (validate(searchString, 'ada')) {
    // ada is case sensitive
    collectionName = 'ada';
  } else if (validator.isEmail(searchString)) {
    collectionName = 'email';
    transformedString = validator.normalizeEmail(searchString, {
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
  } else if (searchString.endsWith('.eth')) {
    collectionName = 'eth-domains';
    transformedString = searchString.toLowerCase();
  } else if (searchString.startsWith('@') && searchString.length <= 16) {
    collectionName = 'twitter';
    transformedString = searchString.substring(1).toLowerCase();
  } else if (getDomain(searchString)) {
    searchString = searchString.toLowerCase();
    const strDomain = parse(searchString, { allowPrivateDomains: true },)['domain'];
    if (strDomain !== null) {
      if (strDomain.endsWith('twitter.com')) {
        const idex = searchString.indexOf('twitter.com/');
        if (idex >= 0) {
          searchString = searchString.slice(idex + 12);
          if (searchString.length > 0) {
            collectionName = 'twitter';
            transformedString = searchString.split('/')[0];
            transformedString = transformedString.toLowerCase();
            console.log('Twitter parsed handle: ', transformedString);
          }
        }
      } else if (strDomain.endsWith('youtube.com') || strDomain.endsWith('youtu.be')) {
        collectionName = 'youtube';

        // First check existance of @channel
        const idex = searchString.indexOf('@');
        if (idex > 0) {
          transformedString = searchString.slice(idex + 1);
        } else {
          const parsedURL = url_parse(searchString, true);

          // First check the Youtube Video ID
          let ytID = 'youtube.com';
          ytID = parsedURL.query['v'];
          //If video ID is not found, then check the channel ID
          if (isEmpty(ytID)) {
            ytID = parsedURL.query['ab_channel'];
            if (isEmpty(ytID)) {
              ytID = 'youtube.com';
            }
          }
          transformedString = ytID;
        }
        console.log('Youtube parsed handle: ', transformedString);
      } else {
        collectionName = 'domains';
        transformedString = strDomain;
      }
    }
  } else if (validate(searchString, 'eos')) {
    collectionName = 'eos';
  } else if (searchString.length <= 15 && searchString.length >= 3) {
    collectionName = 'twitter';
    transformedString = searchString.toLowerCase();
  }

  return [collectionName, transformedString];
};

/**
 * @method searchRequiresQuota
 * @param {string} searchTerm
 * @returns {Boolean} result
 * @description returns true if this search requires quota
 */
export const searchRequiresQuota = (searchTerm: string): Boolean => {
  try {
    if (validate(searchTerm, 'btc')) {
      return true;
    } else if (validate(searchTerm.toLowerCase(), 'eth')) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log('Error in determining chain');
  }

  return false;
};

/**
 * @method getAllChainsForAddress
 * @param {string} walletAddress
 * @returns {string[]} list of chains
 * @description returns all the chains for a particular wallet address
 */
export const getAllChainsForAddress = (walletAddress: string): string[] => {
  const chains = [];

  try {
    if (validate(walletAddress, 'btc')) {
      chains.push('Bitcoin');
    }
    if (validate(walletAddress, 'eth')) {
      chains.push('Ethereum');
    }
    if (validate(walletAddress, 'eth')) {
      chains.push('Ethereum');
    }
    if (validate(walletAddress, 'aave')) {
      chains.push('Aave Coin');
    }
    if (validate(walletAddress, 'zrx')) {
      chains.push('0x');
    }
    if (validate(walletAddress, 'algo')) {
      chains.push('Algorand');
    }
    if (validate(walletAddress, 'ant')) {
      chains.push('Aragon');
    }
    if (validate(walletAddress, 'rep')) {
      chains.push('Augur');
    }
    if (validate(walletAddress, 'repv2')) {
      chains.push('AugurV2');
    }
    if (validate(walletAddress, 'aur')) {
      chains.push('AuroraCoin');
    }
    if (validate(walletAddress, 'avax')) {
      chains.push('Avalanche');
    }
    if (validate(walletAddress, 'bnt')) {
      chains.push('Bancor');
    }
    if (validate(walletAddress, 'bkx')) {
      chains.push('Bankex');
    }
    if (validate(walletAddress, 'bat')) {
      chains.push('Basic Attention Token');
    }
    if (validate(walletAddress, 'bvc')) {
      chains.push('BeaverCoin');
    }
    if (validate(walletAddress, 'bnb')) {
      chains.push('Binance');
    }
    if (validate(walletAddress, 'bio')) {
      chains.push('BioCoin');
    }
    if (validate(walletAddress, 'bsv')) {
      chains.push('Bitcoin SV');
    }
    if (validate(walletAddress, 'bch')) {
      chains.push('BitcoinCash');
    }
    if (validate(walletAddress, 'btg')) {
      chains.push('BitcoinGold');
    }
    if (validate(walletAddress, 'btcp')) {
      chains.push('BitcoinPrivate');
    }
    if (validate(walletAddress, 'btcz')) {
      chains.push('BitcoinZ');
    }
    if (validate(walletAddress, 'btt')) {
      chains.push('BlockTrade');
    }
    if (validate(walletAddress, 'btu')) {
      chains.push('BTU Protocol');
    }
    if (validate(walletAddress, 'clo')) {
      chains.push('Callisto');
    }
    if (validate(walletAddress, 'ada')) {
      chains.push('Cardano');
    }
    if (validate(walletAddress, 'link')) {
      chains.push('Chainlink');
    }
    if (validate(walletAddress, 'cvc')) {
      chains.push('Civic');
    }
    if (validate(walletAddress, 'comp')) {
      chains.push('Compound');
    }
    if (validate(walletAddress, 'lba')) {
      chains.push('Cred');
    }
    if (validate(walletAddress, 'cro')) {
      chains.push('Crypto.com Coin');
    }
    if (validate(walletAddress, 'mana')) {
      chains.push('Decentraland');
    }
    if (validate(walletAddress, 'cusd')) {
      chains.push('CUSD');
    }
    if (validate(walletAddress, 'dash')) {
      chains.push('Dash');
    }
    if (validate(walletAddress, 'dcr')) {
      chains.push('Decred');
    }
    if (validate(walletAddress, 'dgb')) {
      chains.push('DigiByte');
    }
    if (validate(walletAddress, 'dnt')) {
      chains.push('District0x');
    }
    if (validate(walletAddress, 'doge')) {
      chains.push('DogeCoin');
    }
    if (validate(walletAddress, 'enj')) {
      chains.push('Enjin Coin');
    }
    if (validate(walletAddress, 'eos')) {
      chains.push('EOS');
    }
    if (validate(walletAddress, 'etc')) {
      chains.push('EthereumClassic');
    }
    if (validate(walletAddress, 'ethw')) {
      chains.push('EthereumPow');
    }
    if (validate(walletAddress, 'etz')) {
      chains.push('EtherZero');
    }
    if (validate(walletAddress, 'exp')) {
      chains.push('Expanse');
    }
    if (validate(walletAddress, 'fct')) {
      chains.push('FirmaChain');
    }
    if (validate(walletAddress, 'frc')) {
      chains.push('FreiCoin');
    }
    // if (validate(walletAddress, 'flr')) {
    //   chains.push('FLare');
    // }
    if (validate(walletAddress, 'game')) {
      chains.push('GameCredits');
    }
    if (validate(walletAddress, 'grlc')) {
      chains.push('GarliCoin');
    }
    if (validate(walletAddress, 'gno')) {
      chains.push('Gnosis');
    }
    if (validate(walletAddress, 'glm')) {
      chains.push('Golem');
    }
    if (validate(walletAddress, 'gnt')) {
      chains.push('Golem (GNT)');
    }
    if (validate(walletAddress, 'hedg')) {
      chains.push('HedgeTrade');
    }
    if (validate(walletAddress, 'hush')) {
      chains.push('Hush');
    }
    if (validate(walletAddress, 'xsc')) {
      chains.push('HyperSpace');
    }
    if (validate(walletAddress, 'rlc')) {
      chains.push('iExec RLC');
    }
    if (validate(walletAddress, 'kmd')) {
      chains.push('Komodo');
    }
    if (validate(walletAddress, 'lbc')) {
      chains.push('LBRY Credits');
    }
    if (validate(walletAddress, 'lsk')) {
      chains.push('Lisk');
    }
    if (validate(walletAddress, 'ltc')) {
      chains.push('LiteCoin');
    }
    if (validate(walletAddress, 'loki')) {
      chains.push('loki');
    }
    if (validate(walletAddress, 'loom')) {
      chains.push('Loom Network');
    }
    if (validate(walletAddress, 'mkr')) {
      chains.push('Maker');
    }
    if (validate(walletAddress, 'gup')) {
      chains.push('Matchpool');
    }
    if (validate(walletAddress, 'matic')) {
      chains.push('Matic');
    }
    if (validate(walletAddress, 'mec')) {
      chains.push('MegaCoin');
    }
    if (validate(walletAddress, 'mln')) {
      chains.push('Melon');
    }
    if (validate(walletAddress, 'mtl')) {
      chains.push('Metal');
    }
    if (validate(walletAddress, 'mona')) {
      chains.push('MonaCoin');
    }
    if (validate(walletAddress, 'xmr')) {
      chains.push('Monero');
    }
    if (validate(walletAddress, 'dai')) {
      chains.push('Multi-collateral DAI');
    }
    if (validate(walletAddress, 'nmc')) {
      chains.push('NameCoin');
    }
    if (validate(walletAddress, 'nano')) {
      chains.push('Nano');
    }
    if (validate(walletAddress, 'xem')) {
      chains.push('Nem');
    }
    if (validate(walletAddress, 'neo')) {
      chains.push('Neo');
    }
    if (validate(walletAddress, 'gas')) {
      chains.push('NeoGas');
    }
    if (validate(walletAddress, 'nmr')) {
      chains.push('Numeraire');
    }
    if (validate(walletAddress, 'ocean')) {
      chains.push('Ocean Protocol');
    }
    if (validate(walletAddress, 'ocn')) {
      chains.push('Odyssey');
    }
    if (validate(walletAddress, 'omg')) {
      chains.push('OmiseGO');
    }
    if (validate(walletAddress, 'pax')) {
      chains.push('Paxos');
    }
    if (validate(walletAddress, 'ppc')) {
      chains.push('PeerCoin');
    }
    if (validate(walletAddress, 'pivx')) {
      chains.push('PIVX');
    }
    if (validate(walletAddress, 'dot')) {
      chains.push('Polkadot');
    }
    if (validate(walletAddress, 'poly')) {
      chains.push('Polymath');
    }
    if (validate(walletAddress, 'xpm')) {
      chains.push('PrimeCoin');
    }
    if (validate(walletAddress, 'pts')) {
      chains.push('ProtoShares');
    }
    if (validate(walletAddress, 'qtum')) {
      chains.push('Qtum');
    }
    if (validate(walletAddress, 'qnt')) {
      chains.push('Quant');
    }
    if (validate(walletAddress, 'xrp')) {
      chains.push('Ripple');
    }
    if (validate(walletAddress, 'sol')) {
      chains.push('Solana');
    }
    if (validate(walletAddress, 'xlm')) {
      chains.push('Stellar');
    }
    if (validate(walletAddress, 'usdt')) {
      chains.push('Tether');
    }
    if (validate(walletAddress, 'xtz')) {
      chains.push('Tezos');
    }
    if (validate(walletAddress, 'trx')) {
      chains.push('Tron');
    }
    if (validate(walletAddress, 'uni')) {
      chains.push('Uniswap Coin');
    }
    if (validate(walletAddress, 'zec')) {
      chains.push('ZCash');
    }
    if (validate(walletAddress, 'tusd')) {
      chains.push('Tron');
    }
    if (validate(walletAddress, 'trx')) {
      chains.push('TrueUSD');
    }

    // Quantum Resistant Ledger/qrl 'Quantum Resistant Ledger' or 'qrl'
    // RaiBlocks/xrb 'RaiBlocks' or 'xrb'
    // Ripio Credit Network/rcn 'Ripio Credit Network' or 'rcn'
    // Salt/salt 'Salt' or 'salt'
    // Serve/serv 'Serve' or 'serv'
    // Siacoin/sc 'Siacoin' or 'sc'
    // SnowGem/sng 'SnowGem' or 'sng'
    // SolarCoin/slr 'SolarCoin' or 'slr'
    // SOLVE/solve 'SOLVE' or 'solve'
    // Spendcoin/spnd 'Spendcoin' or 'spnd'
    // Status/snt 'Status' or 'snt'
    // Storj/storj 'Storj' or 'storj'
    // Storm/storm 'Storm' or 'storm'
    // StormX/stmx 'StormX' or 'stmx'
    // Swarm City/swt 'Swarm City' or 'swt'
    // Synthetix Network/snx 'Synthetix Network' or 'snx'
    // Tap/xtp 'Tap' or 'xtp'
    // TEMCO/temco 'TEMCO' or 'temco'
    // TenX/pay 'TenX' or 'pay'
    // USD Coin/usdc 'USD Coin' or 'usdc'
    // VeChain/vet 'VeChain' or 'vet'
    // VertCoin/vtc 'VertCoin' or 'vtc'
    // Viberate/vib 'Viberate' or 'vib'
    // VoteCoin/vot 'VoteCoin' or 'vot'
    // Waves/waves 'Waves' or 'waves'
    // Wings/wings 'Wings' or 'wings'
    // ZClassic/zcl 'ZClassic' or 'zcl'
    // ZenCash/zen 'ZenCash' or 'zen'
  } catch (error) {
    console.log('Error in finding chains');
  }

  return chains;
};
