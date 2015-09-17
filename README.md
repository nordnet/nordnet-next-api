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

### Basic usage

```js
import api from 'nordnet-next-api';

api
  .get('https://api.test.nordnet.se/next/2/accounts/{accno}', { accno: 123456789 })
  .then(({ status, data }) => console.log(status, data));
```

Returned response contains status (HTTP response status) and data (JSON parsed response).

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


## Example projects

nordnet-next-api is distributed with a two simple example projects.

First, build the project:

```
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

This open source project released by Nordnet is licenced under the MIT licence.


[api]: https://api.test.nordnet.se/
[api-docs]: https://api.test.nordnet.se/api-docs/index.html

[npm-url]: https://npmjs.org/package/nordnet-next-api
[npm-image]: https://img.shields.io/npm/v/nordnet-next-api.svg

[travis-url]: https://travis-ci.org/nordnet/nordnet-next-api
[travis-image]: https://travis-ci.org/nordnet/nordnet-next-api.svg?branch=master

[depstat-url]: https://david-dm.org/nordnet/nordnet-next-api
[depstat-image]: https://david-dm.org/nordnet/nordnet-next-api.svg
