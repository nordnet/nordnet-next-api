// make phantomjs happy, polyfill .bind etc...
require('es5-shim');

var chai = require('chai');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

// --- Load all common js tests via webpack
var context = require.context('./../src', true, /\.test\.js$/);
context.keys().forEach(context);
