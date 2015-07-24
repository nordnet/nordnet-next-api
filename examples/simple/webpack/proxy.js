var httpProxy = require('http-proxy');
var config = require('./../package.json').config.proxy_server;

//
// Creates the proxy server listening on port 9090 that forwards requests to nExt API test server
//
httpProxy.createServer({
  secure: false,
  changeOrigin: true,
  target: config.forward_to,
}).listen(config.port);
