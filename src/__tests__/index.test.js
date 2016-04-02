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

function testThrows(conditions) {
  return function () {
    conditions.forEach(condition => Object.keys(api).forEach(testMethodThrows(condition)));
  };
}

function testMethodThrows(condition) {
  return method => it(`should throw an error with ${method} and url '${condition}'`,
      () => expect(() => api[method](condition)).to.throw(Error));
}

describe('api', function () {
  describe('when url is invalid', testThrows([undefined, '', '/api/2/accounts/{accno}']));
  describe('when request succeeded', test(tests.getInstrument));
  describe('when request failed', test(tests.getAccounts));
  describe('when response is not JSON', test(tests.ping));
  describe('when making POST request', test(tests.postUserLists));
  describe('when making POST request with JSON payload', test(tests.postUserSettings));
  describe('when making POST JSON request', test(tests.postJson));
});
