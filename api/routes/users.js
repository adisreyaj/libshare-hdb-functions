'use strict';

const authHelpers = require('../helpers/auth-helper');
const userHandlers = require('../helpers/users-handler');

module.exports = async (server, hdb) => {
  server.route({
    url: '/users/:id',
    method: 'GET',
    preValidation: [authHelpers.authenticationCheck(hdb.logger)],
    handler: userHandlers.getUserHandler(hdb),
  });
};
