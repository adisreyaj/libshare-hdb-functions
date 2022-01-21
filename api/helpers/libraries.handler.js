'use strict';

const getLibrariesHandler =
  ({ hdbCore, logger }) =>
  async (request) => {
    request.body = {
      operation: 'sql',
      sql: 'SELECT name,id FROM data.libraries ORDER BY name',
    };
    return hdbCore.requestWithoutAuthentication(request);
  };

module.exports = { getLibrariesHandler };
