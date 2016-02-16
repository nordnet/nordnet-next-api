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
};

function expectUrl(url) {
  expect(this.fetchSpy).to.have.been.calledWith(url);
}

function expectHeaders(headers) {
  expect(this.fetchSpy.args[0][1].headers).to.deep.equal(headers);
}

function expectMethod(method) {
  expect(this.fetchSpy.args[0][1].method).to.equal(method);
}

function expectCredentials() {
  expect(this.fetchSpy.args[0][1].credentials).to.equal('include');
}

function expectBody(body) {
  expect(this.fetchSpy.args[0][1].body).to.deep.equal(body);
}

function expectStatus(status) {
  expect(this.response.status).to.equal(status);
}

function expectData(data) {
  expect(this.response.data).to.deep.equal(data);
}
