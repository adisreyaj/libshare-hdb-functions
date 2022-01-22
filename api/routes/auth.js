'use strict';

const authHelpers = require('../helpers/auth-helper');
const authHandler = require('../helpers/auth-handler');

module.exports = async (server, hdb) => {
  server.route({
    url: '/login',
    method: 'POST',
    preValidation: [authHelpers.validateLoginBody(hdb.logger)],
    handler: authHandler.loginHandler(hdb),
  });
};
