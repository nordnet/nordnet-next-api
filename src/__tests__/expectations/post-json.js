import api from '../../index';

const name = 'abc';
const payload = { name };
const response = { id: 1, name };

export default {
  conditions: {
    request: [
      api.postJson,
      ['/api/2/user/lists', payload],
    ],
    response: [
      'POST',
      '/api/2/user/lists',
      [201, { 'Content-type': 'application/json; charset=UTF-8' }, JSON.stringify(response)],
    ],
  },
  expected: {
    url: '/api/2/user/lists',
    headers: { 'content-type': 'application/json', accept: 'application/json', ntag: 'NO_NTAG_RECEIVED_YET' },
    method: 'post',
    credentials: true,
    body: JSON.stringify(payload),
    status: 201,
    data: response,
    response: true,
  },
};
