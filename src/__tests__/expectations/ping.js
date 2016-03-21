import api from '../../index';

export default {
  conditions: {
    request: [
      api.get,
      ['/api/2/ping'],
    ],
    response: [
      'GET',
      '/api/2/ping',
      [200, {}, 'pong'],
    ],
  },
  expected: {
    url: '/api/2/ping',
    status: 200,
    data: 'pong',
    response: true,
  },
};
