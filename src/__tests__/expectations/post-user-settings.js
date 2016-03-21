import api from '../../index';

const params = { key: 1, settings: { widgets: [{ id: 1, name: 'winners/losers' }] } };
const headers = { 'content-type': 'application/json' };

export default {
  conditions: {
    request: [
      api.post,
      ['/api/2/user/settings/{key}', params, headers],
    ],
    response: [
      'POST',
      '/api/2/user/settings/1',
      [201, { 'Content-type': 'application/json; charset=UTF-8' }, JSON.stringify(params)],
    ],
  },
  expected: {
    url: '/api/2/user/settings/1',
    headers: { 'content-type': 'application/json', accept: 'application/json', ntag: 'NO_NTAG_RECEIVED_YET' },
    method: 'post',
    credentials: true,
    body: JSON.stringify({ settings: params.settings }),
    status: 201,
    data: params,
    response: true,
  },
};
