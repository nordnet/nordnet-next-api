import api from '../../index';

export default {
  conditions: {
    request: [
      api.get,
      ['/api/2/instruments/{instrument_id}?positions={positions}', { instrument_id: 123, positions: [456, 789], accno: 987 }, { 'Accept-Language': 'sv' }],
    ],
    response: [
      'GET',
      '/api/2/instruments/123?positions=456%2C789&accno=987',
      [200, { 'Content-Type': 'application/json; charset=UTF-8' }, JSON.stringify({ instrument_id: 123 })],
    ],
  },
  expected: {
    url: `/api/2/instruments/123?positions=${encodeURIComponent('456,789')}&accno=987`,
    headers: { 'Accept-Language': 'sv', 'Accept': 'application/json' },
    method: 'get',
    credentials: true,
    body: undefined,
    status: 200,
    data: { instrument_id: 123 },
  },
};
