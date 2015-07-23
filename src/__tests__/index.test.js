import 'test-helper';
import { expect } from 'chai';
import { get } from '../index';

describe('next-api', () => {
  let sandbox;
  let promise;
  let response;
  let fetchSpy;

  beforeEach(() => {
    initSandbox();
    initResponses();
    initSpies();
  });

  afterEach(() => sandbox.restore());

  function initSandbox() {
    sandbox = sinon.sandbox.create();
    sandbox.useFakeTimers();
    sandbox.useFakeServer();
    sandbox.server.respondImmediately = true;
  }

  function initResponses() {
    sandbox.server.respondWith('/next/2/accounts', JSON.stringify([{ accno: 123 }]));
    sandbox.server.respondWith('/next/2/accounts/123', JSON.stringify({ accno: 123 }));
    sandbox.server.respondWith('/next/2/accounts/456', [401, {}, '']);
    sandbox.server.respondWith('/next/2/instruments/123?positions=456,789&accno=987', JSON.stringify({ instrument_id: 123 }));
  }

  function initSpies() {
    fetchSpy = sandbox.spy(window, 'fetch');
  }

  function settle(url, params, headers) {
    return function settlePromise() {
      promise = get(url, params, headers)
        .then(res => response = res)
        .catch(res => response = res);
      sandbox.clock.tick(1000);
    };
  }

  function expectUrl(url) {
    expect(fetchSpy.args[0][0]).to.equal(url);
  }

  function expectHeaders(headers) {
    expect(fetchSpy.args[0][1].headers).to.deep.equal(headers);
  }

  describe('URL', () => {
    describe('when url is invalid', () =>
      it('should throw an error', () => expect(() => get('')).to.throw(Error)));

    describe('when path parameters are missing', () =>
      it('should throw an error', () => expect(() => get('/next/2/accounts/{accno}')).to.throw(Error)));

    describe('when path parameters are required', () => {
      beforeEach(settle('/next/2/accounts/{accno}', { accno: 123 }));

      it('should fetch with expected url', (done) => {
        expectUrl('/next/2/accounts/123');
        done();
      });
    });

    describe('when path parameters are not required', () => {
      beforeEach(settle('/next/2/accounts'));

      it('should fetch with expected url', (done) => {
        expectUrl('/next/2/accounts');
        done();
      });
    });

    describe('when path and query parameters are provided', () => {
      beforeEach(settle('/next/2/instruments/{instrument_id}', { instrument_id: 123, positions: [456, 789], accno: 987 }));

      it('should fetch with expected url', (done) => {
        expectUrl('/next/2/instruments/123?positions=456,789&accno=987');
        done();
      });
    });
  });

  describe('promise', () => {
    describe('when HTTP request succeeded', () => {
      beforeEach(settle('/next/2/accounts'));

      it('should resolve promise', (done) => {
        /*eslint-disable */
        expect(promise).should.be.fulfilled;
        /*eslint-enable */
        done();
      });
    });

    describe('when HTTP request fails', () => {
      beforeEach(settle('/next/2/accounts/{accno}', { accno: 456 }));

      it('should reject promise', (done) => {
        /*eslint-disable */
        expect(promise).should.be.rejected;
        /*eslint-enable */
        done();
      });

      it('should set response status', (done) => {
        expect(response.status).to.equal(401);
        done();
      });
    });
  });

  describe('get', () => {
    beforeEach(settle('/next/2/accounts/{accno}', { accno: 123 }, { 'Accept-Language': 'sv' }));

    it('should set expected headers', () => expectHeaders({ Accept: 'application/json', 'Accept-Language': 'sv' }));
    it('should set method \'get\'', () => expect(fetchSpy.args[0][1].method).to.equal('get'));
    it('should include credentials', () => expect(fetchSpy.args[0][1].credentials).to.equal('include'));
  });
});
