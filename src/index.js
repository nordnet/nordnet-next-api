import 'babel-polyfill';
import es6Promise from 'es6-promise';

es6Promise.polyfill();

import 'isomorphic-fetch';

const HTTP_NO_CONTENT = 204;
const HTTP_BAD_REQUEST = 400;

const defaultHeaders = {
  accept: 'application/json',
};

const postDefaultHeaders = Object.assign({
  'content-type': 'application/x-www-form-urlencoded',
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
  const params = omit(options.params, getPathParams(options.url));

  const query = hasQuery(options.method) ? buildParams(params) : undefined;
  const headers = buildHeaders(options.method, options.headers);
  const body = buildBody(options.method, params, headers);

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
    .then(processResponse);
}

function validateStatus(response) {
  if (response.status < HTTP_BAD_REQUEST) {
    return response;
  }

  return toErrorResponse(response);
}

function toErrorResponse(response) {
  return parseContent(response).then(res => Promise.reject(res));
}

function saveNTag(response) {
  state.nTag = response.headers.get('ntag') || state.nTag;
  return response;
}

function processResponse(response) {
  if (response.status === HTTP_NO_CONTENT) {
    return { response, status: response.status };
  }

  return parseContent(response);
}

function parseContent(response) {
  const contentType = response.headers.get('Content-type');
  const method = isJSON(contentType) ? 'json' : 'text';

  return response[method]().then(data => ({ response, data, status: response.status }));
}

function isJSON(contentType) {
  return contains('application/json')(contentType);
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
  return Object.assign({ ntag: state.nTag }, getDefaultMethodHeaders(method), sanitizeHeaders(headers));
}

function getDefaultMethodHeaders(method) {
  return method === 'post' || method === 'put' ? postDefaultHeaders : defaultHeaders;
}

function sanitizeHeaders(obj) {
  return Object.keys(obj).reduce(keyToLowerCase(obj), {});
}

function keyToLowerCase(obj) {
  return (accumulator, key) => {
    accumulator[key.toLowerCase()] = obj[key];
    return accumulator;
  };
}

function buildBody(method, params, headers) {
  if (!hasBody(method)) {
    return undefined;
  }

  return isJsonContentType(headers) ? JSON.stringify(params) : buildParams(params).join('&');
}

function isJsonContentType(headers) {
  const contentType = Object.keys(headers).find(contains('content-type'));
  return isJSON(headers[contentType]);
}

function uriEncode(value) {
  let encoded;
  if (Array.isArray(value)) {
    encoded = value.join(',');
  } else if (isPlainObject(value)) {
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

function contains(string) {
  return function (value) {
    return !!value && value.toLowerCase().indexOf(string) !== -1;
  };
}

function omit(source, props) {
  return Object.keys(source).reduce(omitKey(source, props), {});
}

function omitKey(source, props) {
  return (accumulator, key) => {
    if (props.indexOf(key) === -1) {
      accumulator[key] = source[key];
    }

    return accumulator;
  };
}

function isPlainObject(obj) {
  return obj !== null && typeof obj === 'object';
}
