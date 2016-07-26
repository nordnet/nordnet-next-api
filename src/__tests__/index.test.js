import { initSandBox, respondWith, execute, expectations } from 'test-helper';
import tests from './expectations';
import api from '../index';
import { expect } from 'chai';

function init(done, { request, response }) {
  initSandBox.apply(this);
  respondWith.call(this, response);
  execute.apply(null, request)
    .then(res => this.response = res, res => this.response = res)
    .then(() => done())
    .catch(() => done());
}

function verifyExpectations(expected) {
  Object.keys(expected)
    .forEach(key => it(`should have expected ${key}`, function () {
      expectations[key].call(this, expected[key]);
    }));
}

function test({ conditions, expected }) {
  return function () {
    beforeEach(function (done) {
      init.call(this, done, conditions);
    });

    afterEach(function () {
      this.sandbox.restore();
    });

    verifyExpectations.call(this, expected);
  };
}

function testRejected(conditions) {
  return () => conditions.forEach(
    condition => Object.keys(api)
      .filter(method => method !== 'setConfig')
      .forEach(testMethodRejected(condition)));
}

function testMethodRejected(condition) {
  return method => it(`should reject promise with an error for ${method} and url '${condition}'`,
      () => expect(api[method](condition)).to.be.rejectedWith(Error));
}

describe('api', function () {
  describe('when url is invalid', testRejected([undefined, '']));
  describe('when required path params are missing', testRejected(['/api/2/accounts/{accno}']));
  describe('when request succeeded', test(tests.getInstrument));
  describe.skip('when request failed', test(tests.getAccounts));
  describe('when response is not JSON', test(tests.ping));
  describe('when making POST request', test(tests.postUserLists));
  describe('when making POST request with JSON payload', test(tests.postUserSettings));
  describe('when making POST JSON request', test(tests.postJson));
  describe('when making PUT JSON request', test(tests.putJson));
  describe.skip('when making POST JSON failed request', test(tests.forbidden));
});
