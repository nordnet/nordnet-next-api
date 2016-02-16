import api from '../../index';

export default {
  conditions: {
    request: [
      api.get,
      ['/api/2/accounts'],
    ],
    response: [
      'GET',
      '/api/2/accounts',
      [401, { 'Content-Type': 'application/json; charset=UTF-8' }, JSON.stringify({ code: 'NEXT_INVALID_SESSION' })],
    ],
  },
  expected: {
    url: '/api/2/accounts',
    headers: { 'Accept': 'application/json' },
    method: 'get',
    credentials: true,
    body: undefined,
    status: 401,
    data: { code: 'NEXT_INVALID_SESSION' },
  },
};
