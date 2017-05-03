# Nordnet nExt API Javascript client

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][depstat-image]][depstat-url]

Isomorphic JS client for [Nordnet nExt API][api]. Client can be used both on the client and server side. Client should be used for making HTTP requests towards nExt API. See [nExt API documentation][api-docs] for a list of possible requests.


## Installation

### NPM

```sh
npm install --save nordnet-next-api
```

## Usage

Library can be used on the client and server side.

```js
import api from 'nordnet-next-api';

api
  .get('https://api.test.nordnet.se/next/2')
  .then(({ status, data }) => console.log(status, data));
```

```js
var api = require('nordnet-next-api');
var express = require('express');
var app = express();

app.get('/', function (req, res) {
  api.get('https://api.test.nordnet.se/next/2')
    .then(function(response) {
      res.send(response);
  })
});
```

Authentication is required to be able to use nExt API. `Authorization` header can be used to pass session token when communicating to the API.
See [nExt API documentation][api] for more details on how to get test account and authenticate against nExt API.

### This lib does not use babel-polyfill, so you might have to add it yourself, e.g. if you are building for IE11.

In you application:
```js
import 'babel-polyfill'; // at your application entry point
```

Or in webpack.config.js
```js
{
  entry: ['babel-polyfill', 'your_app_entry.js']
}
```

## API

* `api.get(url, params = {}, headers = {})`
* `api.post(url, params = {}, headers = {})`
* `api.postJson(url, params = {}, headers = {})` — `api.post` with `{ 'Content-type': 'application/json;' }` in headers
* `api.put(url, params = {}, headers = {})`
* `api.putJson(url, params = {}, headers = {})` — `api.put` with `{ 'Content-type': 'application/json;' }` in headers
* `api.del(url, params = {}, headers = {})`

Each method returns a Promise, which resolves or rejects with `Object { response, data, status }` where

* `response`, Type `Object`, [Fetch API Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
* `data`, Type `Object || String || (undefined if HTTP status === 204)`
* `status`, Type `Number`, [HTTP status code](https://developer.mozilla.org/en-US/docs/Web/API/Response/status)

Promise is rejected when HTTP status code is greater or equal 400.

#### url

*Required*  
Type: `String`
Example:

* `/api/2/login`
* `/api/2/accounts/{accno}`
* `/api/2/instruments/{instrument_id}?positions={positions}`

**`Note:` interpolated url params are taken from `params` argument. If `url` contains a key,
which doesn't exist in `params`, promise will be rejected with `Error`.**

#### params

*Required*  
Type: `Object`  
Default: `{}`

Object `params` is used to
* interpolate `url` params.
* if `headers` contains `"Content-type": "application/json"` for constructing request `payload`.
* otherwise for constructing request body.

#### headers

*Required*  
Type: `Object`  
Default: `{}`

See [Fetch API Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers)



### Basic usage

```js
import api from 'nordnet-next-api';

api
  .get('https://api.test.nordnet.se/next/2/accounts/{accno}', { accno: 123456789 })
  .then(({ status, data, response }) => console.log(status, data, response));
```

Returned response contains
* `status` (HTTP response status)
* `data` (either JSON or plain string depending on `Content-type` header)
* `response` ([Response][response] interface of [Fetch API][fetch-api])

### Setting root URL before querying

```js
import api from 'nordnet-next-api';

api.setConfig({ root: 'https://api.test.nordnet.se/next/2' });

api.get('/accounts/{accno}', { accno: 123456789 })
  .then(response => console.log(response));
```

The following config keys are supported:
* `root` sets base root URL
* `ntag` set initial nTag value
* `clientid` set the client-id default header

### Passing path parameters

```js
import { get } from 'nordnet-next-api';

get('https://api.test.nordnet.se/next/2/accounts/{accno}', { accno: 123456789 })
  .then(({ status, data }) => console.log(status, data));
```

### Passing query parameters

```js
import { get } from 'nordnet-next-api';

get('https://api.test.nordnet.se/next/2/news?days={days}', { days: 0 })
  .then(({ status, data }) => console.log(status, data));
```

### Passing POST parameters

```js
import { post } from 'nordnet-next-api';

post('https://api.test.nordnet.se/next/2/user/{key}', { key: 'foo', value: { bar: 'bar' }})
  .then(({ status, data }) => console.log(status, data));
```

### Passing additional headers

```js
import { get } from 'nordnet-next-api';

get('https://api.test.nordnet.se/next/2/markets/{market_id}', { market_id: 11 }, { 'Accept-Language': 'sv' })
  .then(({ status, data }) => console.log(status, data));
```

See tests under `src/__tests__` for more examples.

### Passing custom HTTP agent
```js
import http from 'http';
import { get } from 'nordnet-next-api';

const agent = new http.Agent();

get('https://api.test.nordnet.se/next/2/markets/{market_id}', { market_id: 11 }, { 'Accept-Language': 'sv' }, { agent })
  .then(({ status, data }) => console.log(status, data));
```

### Setting up default HTTP agent
```js
import http from 'http';
import api from 'nordnet-next-api';

const agent = new http.Agent();

api.setConfig({ agent });

get('https://api.test.nordnet.se/next/2/markets/{market_id}', { market_id: 11 }, { 'Accept-Language': 'sv' })
  .then(({ status, data }) => console.log(status, data));
```

## Example projects

nordnet-next-api is distributed with a two simple example projects.

Before proceeding, install dependencies and build the project:

```
npm install
npm run build
```

Run the client side example:

```
cd examples/client
npm install
npm start
```

Run the server side example:

```
cd examples/server
npm install
npm start
```

## License

This Open Source project released by Nordnet is licensed under the MIT license.


[api]: https://api.test.nordnet.se/
[api-docs]: https://api.test.nordnet.se/api-docs/index.html

[response]: https://developer.mozilla.org/en-US/docs/Web/API/Response
[fetch-api]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

[npm-url]: https://npmjs.org/package/nordnet-next-api
[npm-image]: https://img.shields.io/npm/v/nordnet-next-api.svg

[travis-url]: https://travis-ci.org/nordnet/nordnet-next-api
[travis-image]: https://travis-ci.org/nordnet/nordnet-next-api.svg?branch=master

[depstat-url]: https://david-dm.org/nordnet/nordnet-next-api
[depstat-image]: https://david-dm.org/nordnet/nordnet-next-api.svg
