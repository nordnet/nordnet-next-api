const webpack = require('webpack');
const path = require('path');

require('karma-common-js');

var runSourceMap = false;
var runCodeCoverage = false;

process.argv.forEach(function (val) {
  runSourceMap = runSourceMap || (val === '--source-map');
  runCodeCoverage = runCodeCoverage || (/coverage/.test(val));
});

console.log('runCodeCoverage: ' + runCodeCoverage + ', runSourceMap: ' + runSourceMap);

// Only isparta works with code coverage
var codeCoverageLoaders =  [
  {
    test: /^(?!.*test\.js$).*[\.js]$/,
    include: path.resolve('src'),
    loader: 'babel'
  },
  // transpile and instrument testing files with isparta
  {
    test: /\.js$/,
    include: path.resolve('src'),
    loader: 'isparta'
  }
];

//kind of a copy of your webpack config
var webpackConf = {
  devtool: runSourceMap ? 'inline-source-map' : [], //just do inline source maps instead of the default
  module: {
    preLoaders: runCodeCoverage ? codeCoverageLoaders : [],
    loaders: [
      {
        test: /\.js[x]?$/,
        loader: 'babel?presets[]=es2015&plugins[]=add-module-exports',
        exclude: /node_module/
      }
    ]
  },
  plugins: [
    new webpack.IgnorePlugin(/^sinon$/),
    new webpack.NormalModuleReplacementPlugin(/^test-helper$/, __dirname + '/test-helper.js')
  ],
  resolve: {
    extensions: ['', '.js', '.json', '.jsx'],
  }
};


var karmaConf = {

  // Start these browsers, currently available:
  // - Chrome
  // - ChromeCanary
  // - Firefox
  // - Opera
  // - Safari (only Mac)
  // - PhantomJS
  // - IE (only Windows)
  browsers: ['PhantomJS'],


  // make it possible to debug test in chrome
  browserNoActivityTimeout: 3000000,

  // https://github.com/kastork/react-karma-rewire-webpack
  singleRun: true, //just run once by default

  frameworks: [ 'mocha', 'chai', 'sinon-chai'], //use the mocha test framework

  files: [
    '../node_modules/babel-polyfill/dist/polyfill.js',
    'tests.webpack.js' //just load this file
  ],

  preprocessors: {
    //preprocess with webpack and a sourcemap loader
    'tests.webpack.js': runSourceMap ? [ 'webpack' ] : [ 'webpack' , 'sourcemap']
  },

  coverageReporter: {
    reporters: [
      {
        type: 'html',
        dir: './../reports/coverage/html',
        includeAllSources: true
      },
      {
        type: 'cobertura',
        dir: './../reports/coverage/'
      }
    ]
  },

  junitReporter: {
    outputFile: './../reports/test-results.xml',
    suite: ''
  },

  // see https://github.com/webpack/karma-webpack/issues/23
  webpack: webpackConf,

  webpackServer: {
    noInfo: true //please don't spam the console when running in karma!
  }
};

module.exports = function (config) {
  config.set(karmaConf);
};
