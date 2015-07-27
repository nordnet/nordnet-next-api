Nordnet nExt API Javascript client
==================================


Isomorphic JS client for [Nordnet nExt API][api]. Client can be used both on the client and server side. Client should be used for making HTTP requests towards nExt API. See [nExt API documentation][api-docs] for a list of possible requests.

[api]: https://api.test.nordnet.se/
[api-docs]: https://api.test.nordnet.se/api-docs/index.html

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
  .then(response => console.log(response));
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

### Basic usage

```js
import api from 'nordnet-next-api';

api.get('https://api.test.nordnet.se/next/2/accounts/{accno}', { accno: 123456789 })
  .then(response => console.log(response));
```

### Passing path parameters

```js
import api from 'nordnet-next-api';

api.get('https://api.test.nordnet.se/next/2/accounts/{accno}', { accno: 123456789 })
  .then(response => console.log(response));
```

### Passing POST parameters

```js
import api from 'nordnet-next-api';

api.get('https://api.test.nordnet.se/next/2/user/{key}', { key: 'foo', value: { bar: 'bar' }})
  .then(response => console.log(response));
```

### Passing additional headers

```js
import api from 'nordnet-next-api';

api.get('https://api.test.nordnet.se/next/2/markets/{market_id}', { market_id: 80 }, { 'Accept-Language': 'sv' })
  .then(response => console.log(response));
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

All open source code released by Nordnet is licenced under the MIT licence.
