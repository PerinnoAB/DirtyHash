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
import { getDomain } from 'tldts';

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
    collectionName = 'eth';
    transformedString = searchString.toLowerCase();
  } else if (validate(searchString, 'sol')) {
    collectionName = 'sol';
  } else if (validate(searchString, 'trx')) {
    collectionName = 'trx';
  } else if (validate(searchString, 'bnb')) {
    collectionName = 'bnb';
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
    const strDomain = getDomain(searchString);
    if (strDomain !== null) {
      if (strDomain === 'twitter.com') {
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
      } else if (strDomain === 'youtube.com') {
        collectionName = 'youtube';
        const url = new URL(searchString);
        // First check the Youtube Video ID
        let ytID = url.searchParams.get('v');
        //If video ID is not found, then check the channel ID
        if (ytID === null) {
          ytID = url.pathname.substring(1);
          if (ytID.startsWith('@')) ytID = ytID.substring(1);
        }

        transformedString = ytID;
        console.log('Youtube parsed handle: ', transformedString);
      } else {
        collectionName = 'domains';
        transformedString = strDomain;
      }
    }
  } else if (validate(searchString, 'eos')) {
    collectionName = 'eos';
  } else if (searchString.length <= 15) {
    collectionName = 'twitter';
    transformedString = searchString.toLowerCase();
  }

  return [collectionName, transformedString];
};
