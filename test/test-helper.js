require('es5-shim'); // make phantomjs happy

if (!global.Promise) {
  console.log('load promise shim');
  require('native-promise-only');
}

var sinon = global.sinon;
if (!sinon) {
  window.lolex = require('lolex');
  sinon = require('sinon');
}

var testHelperConfig = {
  immediate: true
};

var lodash     = require('lodash');
var lodashId   = require.resolve('lodash');
var chai       = require('chai');

var chaiArray = require('chai-array');
chai.use(function (chai, utils) {
  return chaiArray(chai, utils);
});

var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

var testHelper = require('nordnet-test-helper')({
  sinon: sinon,
  chai: chai,
  lodash: lodash,
  lodashId: lodashId,
  promise: Promise,
  defaults: {
    immediate: false
  }
});

function getComponentMethod(component, method) {
  return component.__reactAutoBindMap[method].bind(component);
}

testHelper.getComponentMethod = getComponentMethod;

var sinonChai  = require('sinon-chai');
chai.use(sinonChai);

// ---- Globals, nice to have
global._          = lodash;
global.sinon      = sinon;
global.testHelper = testHelper;
global.expect     = chai.expect;

module.exports = testHelper;
