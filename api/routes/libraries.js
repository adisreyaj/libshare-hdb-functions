'use strict';

const authHelpers = require('../helpers/auth-helper');
const libraryHandlers = require('../helpers/libraries-handler');

module.exports = async (server, hdb) => {
  server.route({
    url: '/libraries',
    method: 'GET',
    preValidation: [authHelpers.authenticationCheck(hdb.logger)],
    handler: libraryHandlers.getLibrariesHandler(hdb),
  });

  server.route({
    url: '/libraries/search',
    method: 'GET',
    preValidation: [authHelpers.authenticationCheck(hdb.logger)],
    handler: libraryHandlers.getLibrariesSearchHandler(hdb),
  });

  server.route({
    url: '/libraries',
    method: 'POST',
    preValidation: [authHelpers.authenticationCheck(hdb.logger)],
    handler: libraryHandlers.addLibraryHandler(hdb),
  });

  server.route({
    url: '/libraries/:id',
    method: 'PUT',
    preValidation: [authHelpers.authenticationCheck(hdb.logger)],
    handler: libraryHandlers.updateLibraryHandler(hdb),
  });

  server.route({
    url: '/libraries/:id',
    method: 'DELETE',
    preValidation: [authHelpers.authenticationCheck(hdb.logger)],
    handler: libraryHandlers.deleteLibraryHandler(hdb),
  });

  server.route({
    url: '/libraries/suggestions/:query',
    method: 'GET',
    preValidation: [authHelpers.authenticationCheck(hdb.logger)],
    handler: libraryHandlers.librarySuggestionsHandler(hdb),
  });

  server.route({
    url: '/libraries/metadata/:libraryName',
    method: 'GET',
    preValidation: [authHelpers.authenticationCheck(hdb.logger)],
    handler: libraryHandlers.libraryMetadataHandler(hdb),
  });

  server.route({
    url: '/libraries/:id',
    method: 'GET',
    preValidation: [authHelpers.authenticationCheck(hdb.logger)],
    handler: libraryHandlers.getLibraryHandler(hdb),
  });
};
