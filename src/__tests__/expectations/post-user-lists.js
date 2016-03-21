import api from '../../index';

const name = 'abc';
const params = { name };
const response = { id: 1, name };

export default {
  conditions: {
    request: [
      api.post,
      ['/api/2/user/lists', params],
    ],
    response: [
      'POST',
      '/api/2/user/lists',
      [201, { 'Content-type': 'application/json; charset=UTF-8' }, JSON.stringify(response)],
    ],
  },
  expected: {
    url: '/api/2/user/lists',
    headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json', ntag: 'NO_NTAG_RECEIVED_YET' },
    method: 'post',
    credentials: true,
    body: `name=${name}`,
    status: 201,
    data: response,
    response: true,
  },
};
