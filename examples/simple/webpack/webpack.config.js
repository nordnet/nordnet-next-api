var path = require('path');
var util = require('util');
var webpack = require('webpack');

var pkg = require('./../package.json');

var port = pkg.config.dev_server.port;
var host = pkg.config.dev_server.host;

module.exports = {
  context: path.join(__dirname, '../src'),
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?' + util.format('https://%s:%d', host, port),
    'webpack/hot/only-dev-server',
    './index',
  ],
  output: {
    path: path.join(__dirname, '../dist'),
    filename: 'bundle.js',
    publicPath: '/static/',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
  ],
  resolve: {
    alias: {
      'nordnet-next-api': path.join(__dirname, '../../../src'),
    },
    extensions: ['', '.js', '.jsx'],
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ['react-hot', 'babel'],
      exclude: /node_modules/,
      include: path.join(__dirname, '../src'),
    }, {
      test: /\.js$/,
      loaders: ['babel'],
      include: path.join(__dirname, '../../../src'),
    }]
  }
};
