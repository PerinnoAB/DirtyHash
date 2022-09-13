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
  } else if (searchString.startsWith('@')) {
    collectionName = 'twitter';
  } else if (getDomain(searchString)) {
    const strDomain = getDomain(searchString);
    if (strDomain !== null) {
      if (strDomain === 'twitter.com') {
        searchString = searchString.slice(searchString.indexOf('twitter.com/') + 12);
        if (searchString.length > 0) {
          collectionName = 'twitter';
          transformedString = '@' + searchString.split('/')[0];
          console.log('Twitter parsed handle: ', transformedString);
        }
      } else {
        collectionName = 'domains';
        transformedString = strDomain;
      }
    }
  } else if (validate(searchString, 'eos')) {
    collectionName = 'eos';
  }

  return [collectionName, transformedString];
};
