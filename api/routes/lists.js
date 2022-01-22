'use strict';

const listHandlers = require('../helpers/list-handler');
const authHelpers = require('../helpers/auth-helper');

module.exports = async (server, hdb) => {
  server.route({
    url: '/lists',
    method: 'GET',
    preValidation: [authHelpers.authenticationCheck(hdb.logger)],
    handler: listHandlers.getListsHandler(hdb),
  });

  server.route({
    url: '/lists',
    method: 'POST',
    preValidation: [authHelpers.authenticationCheck(hdb.logger)],
    handler: listHandlers.addListHandler(hdb),
  });

  server.route({
    url: '/lists/:id',
    method: 'PATCH',
    preValidation: [authHelpers.authenticationCheck(hdb.logger)],
    handler: listHandlers.addListHandler(hdb),
  });

  server.route({
    url: '/lists/:id',
    method: 'GET',
    preValidation: [authHelpers.authenticationCheck(hdb.logger)],
    handler: listHandlers.getListHandler(hdb),
  });
};
