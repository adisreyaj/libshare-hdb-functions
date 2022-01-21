'use strict';

const { getLibrariesHandler } = require('../helpers/libraries.handler');

module.exports = async (server, hdb) => {
  server.route({
    url: '/libraries',
    method: 'GET',
    handler: getLibrariesHandler(hdb),
  });
};
