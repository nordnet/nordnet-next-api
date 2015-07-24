import 'test-helper';
import { expect } from 'chai';
import { get } from './../index';
import { post } from './../index';
import { put } from './../index';
import { del } from './../index';

describe('next-api', () => {
  const ntag = 'qwerty-12345-6789';

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
    sandbox.server.respondWith('/next/2/accounts/123', JSON.stringify({ accno: 123 }));
    sandbox.server.respondWith('GET', '/next/2/user/settings/foo',
      [204, { 'Content-Type': 'application/json; charset=UTF-8', ntag: ntag }, '']);
    sandbox.server.respondWith('POST', '/next/2/user/settings/bar',
      [200, { 'Content-Type': 'application/json; charset=UTF-8', ntag: ntag }, JSON.stringify([{ key: 'bar', value: { bar: 'bar' }}])]);
    sandbox.server.respondWith('PUT', '/next/2/user/settings/bar',
      [200, { 'Content-Type': 'application/json; charset=UTF-8', ntag: ntag }, JSON.stringify([{ key: 'bar', value: { bar: 'bar' }}])]);
    sandbox.server.respondWith('DELETE', '/next/2/user/settings/bar',
      [200, { 'Content-Type': 'application/json; charset=UTF-8', ntag: ntag }, '']);
  }

  function initSpies() {
    fetchSpy = sandbox.spy(window, 'fetch');
  }

  function settle(method, url, params, headers) {
    return function settlePromise() {
      promise = method(url, params, headers)
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
      beforeEach(settle(get, '/next/2/accounts/{accno}', { accno: 123 }));

      it('should fetch with expected url', (done) => {
        expectUrl('/next/2/accounts/123');
        done();
      });
    });

    describe('when path parameters are not required', () => {
      beforeEach(settle(get, '/next/2/accounts'));

      it('should fetch with expected url', (done) => {
        expectUrl('/next/2/accounts');
        done();
      });
    });

    describe('when path and query parameters are provided', () => {
      beforeEach(settle(get, '/next/2/instruments/{instrument_id}', { instrument_id: 123, positions: [456, 789], accno: 987 }));

      it('should fetch with expected url', (done) => {
        expectUrl('/next/2/instruments/123?positions=' + encodeURIComponent('456,789') + '&accno=987');
        done();
      });
    });

    describe('when path contains query parameters', () => {
      beforeEach(settle(get, '/next/2/instruments/{instrument_id}?positions={positions}', { instrument_id: 123, positions: [456, 789], accno: 987 }));

      it('should fetch with expected url', (done) => {
        expectUrl('/next/2/instruments/123?positions=' + encodeURIComponent('456,789') + '&accno=987');
        done();
      });
    });
  });

  describe('promise', () => {
    describe('when HTTP request succeeded', () => {
      beforeEach(settle(get, '/next/2/accounts'));

      it('should resolve promise', (done) => {
        /*eslint-disable */
        expect(promise).should.be.fulfilled;
        /*eslint-enable */
        done();
      });
    });

    describe('when HTTP request fails', () => {
      beforeEach(settle(get, '/next/2/accounts/{accno}', { accno: 456 }));

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
    beforeEach(settle(get, '/next/2/accounts/{accno}', { accno: 123 }, { 'Accept-Language': 'sv' }));

    it('should set expected headers', () => expectHeaders({ Accept: 'application/json', 'Accept-Language': 'sv' }));
    it('should set method \'get\'', () => expect(fetchSpy.args[0][1].method).to.equal('get'));
    it('should include credentials', () => expect(fetchSpy.args[0][1].credentials).to.equal('include'));
    it('should not set body', () => expect(fetchSpy.args[0][1].body).to.be.undefined);
  });

  describe('post', () => {
    beforeEach(settle(get, '/next/2/user/settings/{key}', { key: 'foo' }, { 'Accept-Language': 'sv' }));

    describe('when parameters are missing', () => {
      beforeEach(settle(post, '/next/2/user/settings/{key}', { key: 'bar' }, { 'Accept-Language': 'sv' }));
      it('should set empty POST body', () => expect(fetchSpy.args[1][1].body).to.equal(''));
    });

    describe('when parameters are provided', () => {
      beforeEach(settle(post, '/next/2/user/settings/{key}', { key: 'bar', value: { bar: 'bar' }}, { 'Accept-Language': 'sv' }));
      it('should set POST body', () => expect(fetchSpy.args[1][1].body).to.deep.equal('value=' + encodeURIComponent(JSON.stringify({ bar: 'bar' }))));
    });

    describe('when making POST request', () => {
      beforeEach(settle(post, '/next/2/user/settings/{key}', { key: 'bar', value: { bar: 'bar' }}, { 'Accept-Language': 'sv' }));

      it('should set ntag header', () =>
        expect(fetchSpy.args[1][1].headers).to.deep.equal(
          { 'Content-type': 'application/x-www-form-urlencoded', Accept: 'application/json', 'Accept-Language': 'sv', ntag: ntag }));
      it('should set method \'post\'', () => expect(fetchSpy.args[1][1].method).to.equal('post'));
      it('should include credentials', () => expect(fetchSpy.args[1][1].credentials).to.equal('include'));
    });
  });

  describe('put', () => {
    beforeEach(() => {
      settle(get, '/next/2/user/settings/{key}', { key: 'foo' }, { 'Accept-Language': 'sv' })();
      settle(put, '/next/2/user/settings/{key}', { key: 'bar', value: { bar: 'bar' }}, { 'Accept-Language': 'sv' })();
    });

    it('should set ntag header', () =>
      expect(fetchSpy.args[1][1].headers).to.deep.equal(
        { 'Content-type': 'application/x-www-form-urlencoded', Accept: 'application/json', 'Accept-Language': 'sv', ntag: ntag }));
    it('should set PUT body', () => expect(fetchSpy.args[1][1].body).to.deep.equal('value=' + encodeURIComponent(JSON.stringify({ bar: 'bar' }))));
    it('should set method \'put\'', () => expect(fetchSpy.args[1][1].method).to.equal('put'));
    it('should include credentials', () => expect(fetchSpy.args[1][1].credentials).to.equal('include'));
  });

  describe('delete', () => {
    beforeEach(() => {
      settle(get, '/next/2/user/settings/{key}', { key: 'foo' }, { 'Accept-Language': 'sv' })();
      settle(del, '/next/2/user/settings/{key}', { key: 'bar' }, { 'Accept-Language': 'sv' })();
    });

    it('should set ntag header', () =>
      expect(fetchSpy.args[1][1].headers).to.deep.equal(
        { Accept: 'application/json', 'Accept-Language': 'sv', ntag: ntag }));
    it('should not set body', () => expect(fetchSpy.args[1][1].body).to.be.undefined);
    it('should set method \'delete\'', () => expect(fetchSpy.args[1][1].method).to.equal('delete'));
    it('should include credentials', () => expect(fetchSpy.args[1][1].credentials).to.equal('include'));
  });
});
