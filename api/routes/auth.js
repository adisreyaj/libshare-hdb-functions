'use strict';

const authHelpers = require('../helpers/auth-helper');
const authHandler = require('../helpers/auth-handler');
const userHelpers = require('../helpers/users-helper');
const userHandlers = require('../helpers/users-handler');

module.exports = async (server, hdb) => {
  server.route({
    url: '/login',
    method: 'POST',
    preValidation: [authHelpers.validateLoginBody(hdb.logger)],
    handler: authHandler.loginHandler(hdb),
  });

  server.route({
    url: '/signup',
    method: 'POST',
    preValidation: userHelpers.validateUser(hdb.logger),
    handler: userHandlers.createUserHandler(hdb),
  });
};
