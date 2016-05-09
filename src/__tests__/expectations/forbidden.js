import api from '../../index';

const name = 'name';
const payload = { name };

export default {
  conditions: {
    request: [
      api.postJson,
      ['/api/2/user/lists', payload],
    ],
    response: [
      'POST',
      '/api/2/user/lists',
      [403, { 'Content-type': 'application/json; charset=UTF-8' }, JSON.stringify({ code: 'NEXT_INVALID_SESSION' })],
    ],
  },
  expected: {
    url: '/api/2/user/lists',
    headers: { 'content-type': 'application/json', accept: 'application/json', ntag: 'NO_NTAG_RECEIVED_YET' },
    method: 'post',
    credentials: true,
    body: undefined,
    status: 403,
    data: { code: 'NEXT_INVALID_SESSION' },
    response: true,
  },
};
