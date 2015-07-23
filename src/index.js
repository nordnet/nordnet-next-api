import es6Promise from 'es6-promise';

es6Promise.polyfill();

import 'whatwg-fetch';
import _ from 'lodash';

const defaultHeaders = {
  Accept: 'application/json',
};

const postDefaultHeaders = _.merge({
  'Content-type': 'application/x-www-form-urlencoded',
}, defaultHeaders);

const state ={
  nTag: 'NO_NTAG_RECEIVED_YET'
};

export function get(url, params = {}, headers = {}) {
  const options = {
    url,
    params,
    buildQuery: true,
    headers: _.merge({}, headers, defaultHeaders),
    method: 'get',
  };

  return httpFetch(options);
}

export function post(url, params, headers) {
  const options = {
    url,
    params,
    headers: _.merge({ ntag: state.nTag }, headers, postDefaultHeaders),
    method: 'post',
  };

  return httpFetch(options);
}

export function put() {
  const options = {
    url,
    params,
    headers: _.merge({ ntag: state.nTag }, headers, postDefaultHeaders),
    method: 'put',
  };

  return httpFetch(options);
}

export function del() {
  const options = {
    url,
    params,
    buildQuery: true,
    headers: _.merge({ ntag: state.nTag }, headers, defaultHeaders),
    method: 'delete',
  };

  return httpFetch(options);
}

function httpFetch(options) {
  validateUrl(options.url);

  const path = buildPath(options.url, options.params);
  const query = options.buildQuery ? buildQuery(_.omit(options.params, getPathParams(options.url))) : '';
  // TODO build body
  
  const fetchUrl = buildUrl(path, query);

  const fetchParams = {
    method: options.method,
    headers: options.headers,
    credentials: 'include',
  };

  return fetch(fetchUrl, fetchParams)
    .then(validateStatus)
    .then(saveNTag)
    .then(toJSON);
}

function validateStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  }

  return Promise.reject(response);
}

function saveNTag(response) {
  state.nTag = response.headers.get('ntag') || state.nTag;
}

function toJSON(response) {
  return response.json();
}

function validateUrl(url) {
  if (!url) {
    throw new Error('Invalid URL');
  }
}

function getPathParams(url) {
  const keys = url.match(/{([\s\S]+?)}/g) || [];
  return keys.reduce(getPathParam, []);
}

function getPathParam(result, key) {
  result.push(key.replace(/({|})/g, ''));
  return result;
}

function buildUrl(path, query) {
  const queryParams = query.length ? query.join('&') : '';
  const pathContainsQuery = path.indexOf('?') !== -1;

  let delimiter = '';
  if (pathContainsQuery) {
    delimiter = '&';
  } else if (queryParams) {
    delimiter = '?';
  }

  return `${path}${delimiter}${queryParams}`;
}

function buildPath(url, params) {
  return url.replace(/{([\s\S]+?)}/g, matchParams(params));
}

function matchParams(params) {
  return function matchParamKeyValue(match, key) {
    if (!params[key]) {
      throw new Error(`unknown parameter ${key}`);
    }

    return params[key];
  };
}

function buildQuery(params = {}) {
  return Object.keys(params).reduce(buildQueryParam(params), []);
}

function buildQueryParam(params) {
  return function buildQueryParamKeyValue(result, key) {
    const value = Array.isArray(params[key]) ? params[key].join(',') : params[key];
    result.push(`${key}=${value}`);
    return result;
  };
}
