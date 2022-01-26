'use strict';

module.exports = async (server) => {
  server.route({
    url: '/',
    method: 'GET',
    handler: () => {
      return {
        status: 'OK',
      };
    },
  });
};
