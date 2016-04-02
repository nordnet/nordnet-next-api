// make phantomjs happy, polyfill .bind etc...
require('es5-shim');

var chai = require('chai');
var sinonChai = require('sinon-chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(sinonChai);
chai.use(chaiAsPromised);

// --- Load all common js tests via webpack
var context = require.context('./../src', true, /\.test\.js$/);
context.keys().forEach(context);
