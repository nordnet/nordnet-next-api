import { expect } from 'chai';

export function initSandBox() {
  this.sandbox = sinon.sandbox.create();
  this.sandbox.useFakeServer();
  this.sandbox.server.autoRespond = true;
  this.fetchSpy = this.sandbox.spy(window, 'fetch');
}

export function respondWith(response) {
  this.sandbox.server.respondWith.apply(this.sandbox.server, response);
}

export function execute(method, request) {
  return method.apply(null, request);
}

export const expectations = {
  url: expectUrl,
  headers: expectHeaders,
  method: expectMethod,
  credentials: expectCredentials,
  body: expectBody,
  status: expectStatus,
  data: expectData,
  response: expectResponse,
};

function expectUrl(url) {
  expect(this.fetchSpy).to.have.been.calledWith(url);
}

function expectHeaders(headers) {
  expectDeepEqual(headers, this.fetchSpy.args[0][1].headers);
}

function expectMethod(method) {
  expectEqual(method, this.fetchSpy.args[0][1].method);
}

function expectCredentials() {
  expectEqual('include', this.fetchSpy.args[0][1].credentials);
}

function expectBody(body) {
  expectDeepEqual(body, this.fetchSpy.args[0][1].body);
}

function expectStatus(status) {
  expectEqual(status, this.response.status);
}

function expectData(data) {
  expectDeepEqual(data, this.response.data);
}

function expectResponse() {
  expect(this.response.response).to.not.be.undefined;
}

function expectEqual(expected, actual) {
  expect(actual).to.equal(expected);
}

function expectDeepEqual(expected, actual) {
  expect(actual).to.deep.equal(expected);
}
