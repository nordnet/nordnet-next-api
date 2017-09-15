import 'isomorphic-fetch';

const HTTP_NO_CONTENT = 204;
const HTTP_BAD_REQUEST = 400;
const regUrlParam = /{([\s\S]+?)}/g;

const defaultHeaders = {
  accept: 'application/json',
};

function postDefaultHeaders() {
  return Object.assign(
    { 'content-type': 'application/x-www-form-urlencoded' },
    defaultHeaders
  );
}

const state = {
  ntag: 'NO_NTAG_RECEIVED_YET',
};

const credentials = 'include';

const config = {};
const configKeys = ['root', 'agent'];

export function setConfig(options = {}) {
  // HTTP headers should be lowercase, but we support camelCase for backwards compatibility
  const lowerCaseOptions = sanitizeHeaders(options);
  configKeys.forEach(key => config[key] = options[key]);

  if (lowerCaseOptions.ntag) {
    state.ntag = lowerCaseOptions.ntag;
  }
  if (lowerCaseOptions.clientid) {
    defaultHeaders['client-id'] = lowerCaseOptions.clientid;
  }
}

export function get(url, params = {}, headers = {}, options = {}) {
  const fetchOptions = Object.assign({
    url,
    params,
    headers,
    method: 'get',
  }, options);

  return httpFetch(fetchOptions);
}

export function post(url, params = {}, headers = {}, options = {}) {
  const fetchOptions = Object.assign({
    url,
    params,
    headers,
    method: 'post',
  }, options);

  return httpFetch(fetchOptions);
}

export function postJson(url, params = {}, headers = {}, options = {}) {
  return post(url, params, Object.assign(headers, { 'Content-type': 'application/json' }, options));
}

export function put(url, params = {}, headers = {}, options = {}) {
  const fetchOptions = Object.assign({
    url,
    params,
    headers,
    method: 'put',
  }, options);

  return httpFetch(fetchOptions);
}

export function putJson(url, params = {}, headers = {}, options = {}) {
  return put(url, params, Object.assign(headers, { 'Content-type': 'application/json' }, options));
}

export function del(url, params = {}, headers = {}, options = {}) {
  const fetchOptions = Object.assign({
    url,
    params,
    headers,
    method: 'delete',
  }, options);

  return httpFetch(fetchOptions);
}

export default {
  get,
  post,
  postJson,
  put,
  putJson,
  del,
  setConfig,
};

function httpFetch(options) {
  if (!options.url) { // @TODO should check type
    return Promise.reject(new Error(`Invalid url, got \`${options.url}\``));
  }

  if (isNotValidPath(options.url, options.params)) { // @TODO should check types
    return Promise.reject(new Error(`Params object doesn't have all required keys for url.
      Got url \`${options.url}\` and params \`${JSON.stringify(options.params)}\``));
  }

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

  if (options.agent) {
    Object.assign(fetchParams, { agent: options.agent });
  } else if (config.agent) {
    Object.assign(fetchParams, { agent: config.agent });
  }

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
  state.ntag = response.headers.get('ntag') || state.ntag;
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
  let method = isJSON(contentType) ? 'json' : 'text';

  if (isBlob(contentType)) {
    method = 'blob';
  }

  return response[method]()
    .then(data => ({ response, data, status: response.status }))
    .catch(error => Promise.reject({
      response,
      status: response.status,
      error: new Error(`fetch unable to parse input, most likely API responded with empty reponse.
        Original Error: ${error}`),
    }));
}

function isJSON(contentType) {
  return contains('application/json')(contentType);
}

function isBlob(contentType) {
  return contains('application/pdf')(contentType);
}

function getPathParams(url) {
  const keys = url.match(regUrlParam) || [];
  return keys.map(key => key.replace(/({|})/g, ''));
}

function buildUrl(path, query = '') {
  const queryParams = query.length ? query.join('&') : '';
  const pathContainsQuery = path.indexOf('?') !== -1;
  const pathContainsProtocol = !!(path.match(/^http(s)?:\/\//));

  let root = '';
  if (!pathContainsProtocol && typeof config.root !== 'undefined') {
    root = config.root;
  }

  let delimiter = '';
  if (pathContainsQuery && queryParams) {
    delimiter = '&';
  } else if (queryParams) {
    delimiter = '?';
  }

  return `${root}${path}${delimiter}${queryParams}`;
}

function isNotValidPath(url, params = {}) {
  return !!(url.match(regUrlParam) || [])
    .map(key => key.replace(/({|})/g, ''))
    .find(key => !params[key] && params[key] !== 0);
}

function buildPath(url, params) {
  return url.replace(regUrlParam, matchParams(params));
}

function matchParams(params) {
  return function matchParamKeyValue(match, key) {
    return uriEncode(params[key]);
  };
}

function buildParams(params = {}) {
  return Object.keys(params).map(key => encodeURIComponent(key) + '=' + uriEncode(params[key]));
}

function buildHeaders(method, headers) {
  return Object.assign({ ntag: state.ntag }, getDefaultMethodHeaders(method), sanitizeHeaders(headers));
}

function getDefaultMethodHeaders(method) {
  return method === 'post' || method === 'put' ? postDefaultHeaders() : defaultHeaders;
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
