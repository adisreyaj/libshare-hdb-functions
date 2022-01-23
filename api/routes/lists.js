'use strict';

const listHandlers = require('../helpers/list-handler');
const authHelpers = require('../helpers/auth-helper');
const listHelpers = require('../helpers/list-helper');

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
    preValidation: [
      authHelpers.authenticationCheck(hdb.logger),
      listHelpers.validateNewList(hdb.logger),
    ],
    handler: listHandlers.addListHandler(hdb),
  });

  server.route({
    url: '/lists/:id',
    method: 'PUT',
    preValidation: [
      authHelpers.authenticationCheck(hdb.logger),
      listHelpers.validateUpdateList(hdb.logger),
    ],
    handler: listHandlers.updateListHandler(hdb),
  });

  server.route({
    url: '/lists/:id',
    method: 'GET',
    preValidation: [authHelpers.authenticationCheck(hdb.logger)],
    handler: listHandlers.getListHandler(hdb),
  });

  server.route({
    url: '/lists/:id',
    method: 'DELETE',
    preValidation: [authHelpers.authenticationCheck(hdb.logger)],
    handler: listHandlers.deleteListHandler(hdb),
  });
};
