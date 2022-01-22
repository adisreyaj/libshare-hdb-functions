'use strict';

const authHelpers = require('../helpers/auth-helper');
const userHandlers = require('../helpers/users-handler');
const userHelpers = require('../helpers/users-helper');

module.exports = async (server, hdb) => {
  server.route({
    url: '/users',
    method: 'POST',
    preValidation: userHelpers.validateUser(hdb.logger),
    handler: userHandlers.createUserHandler(hdb),
  });

  server.route({
    url: '/users/:id',
    method: 'GET',
    preValidation: [authHelpers.authenticationCheck(hdb.logger)],
    handler: userHandlers.getUserHandler(hdb),
  });
};
