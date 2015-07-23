var opn = require('opn');
var util = require('util');
var path = require('path');

var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');

var pkg = require('./../package.json');

var port = pkg.config.dev_server.port;
var host = pkg.config.dev_server.host;

new WebpackDevServer(webpack(config), {
  host: '0.0.0.0',
  contentBase: path.join(__dirname, './../src'),
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  stats: {
    colors: true
  }
}).listen(port, host, function (err) {
  if (err) {
    console.log(err);
  }
  var url = util.format('http://%s:%d', host, port);
  console.log('Listening at %s', url);
  opn(url);
});
