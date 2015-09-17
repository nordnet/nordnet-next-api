import es6Promise from 'es6-promise';

es6Promise.polyfill();

import 'isomorphic-fetch';
import _ from 'lodash';

const defaultHeaders = {
  Accept: 'application/json',
};

const postDefaultHeaders = _.merge({
  'Content-type': 'application/x-www-form-urlencoded',
}, defaultHeaders);

const state = {
  nTag: 'NO_NTAG_RECEIVED_YET',
};

const credentials = 'include';

export function get(url, params = {}, headers = {}) {
  const options = {
    url,
    params,
    headers,
    method: 'get',
  };

  return httpFetch(options);
}

export function post(url, params = {}, headers = {}) {
  const options = {
    url,
    params,
    headers,
    method: 'post',
  };

  return httpFetch(options);
}

export function put(url, params = {}, headers = {}) {
  const options = {
    url,
    params,
    headers,
    method: 'put',
  };

  return httpFetch(options);
}

export function del(url, params = {}, headers = {}) {
  const options = {
    url,
    params,
    headers,
    method: 'delete',
  };

  return httpFetch(options);
}

export default {
  get,
  post,
  put,
  del,
};

function httpFetch(options) {
  validateUrl(options.url);

  const path = buildPath(options.url, options.params);
  const params = buildParams(_.omit(options.params, getPathParams(options.url)));

  const query = hasQuery(options.method) ? params : undefined;
  const body = hasBody(options.method) ? params.join('&') : undefined;
  const headers = buildHeaders(options.method, options.headers);

  const fetchUrl = buildUrl(path, query);

  const fetchParams = {
    headers,
    credentials,
    body,
    method: options.method,
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
  return response;
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
  return keys.map(key => key.replace(/({|})/g, ''));
}

function buildUrl(path, query = '') {
  const queryParams = query.length ? query.join('&') : '';
  const pathContainsQuery = path.indexOf('?') !== -1;

  let delimiter = '';
  if (pathContainsQuery && queryParams) {
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
    if (params[key] === undefined) {
      throw new Error(`unknown parameter ${key}`);
    }

    return uriEncode(params[key]);
  };
}

function buildParams(params = {}) {
  return Object.keys(params).map(key => encodeURIComponent(key) + '=' + uriEncode(params[key]));
}

function buildHeaders(method, headers) {
  if (method === 'post' || method === 'put') {
    return _.merge({ ntag: state.nTag }, headers, postDefaultHeaders);
  } else if (method === 'delete') {
    return _.merge({ ntag: state.nTag }, headers, defaultHeaders);
  }

  return _.merge({}, headers, defaultHeaders);
}

function uriEncode(value) {
  let encoded;
  if (Array.isArray(value)) {
    encoded = value.join(',');
  } else if (_.isPlainObject(value)) {
    encoded = JSON.stringify(value);
  } else {
    encoded = value;
  }

  return encodeURIComponent(encoded);
}

function hasQuery(method) {
  return method === 'get' || method === 'delete';
}

function hasBody(method) {
  return method === 'post' || method === 'put';
}
