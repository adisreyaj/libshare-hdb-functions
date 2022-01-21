'use strict';
const qb = require('./query-builder.helper');

const getLibrariesHandler =
  ({ hdbCore }) =>
  async (request) => {
    request.body = {
      operation: 'sql',
      sql: qb.buildGetQuery('data.libraries', ['name', 'id'], {
        where: {
          user: request.jwt.aud,
        },
        orderBy: 'name',
      }),
    };
    return hdbCore.requestWithoutAuthentication(request);
  };

const getLibraryHandler =
  ({ hdbCore }) =>
  async (request) => {
    request.body = {
      operation: 'sql',
      sql: qb.buildGetQuery('data.libraries', ['name', 'id'], {
        where: {
          user: request.jwt.id,
          id: request.params.id,
        },
        limit: 1,
      }),
    };
    return hdbCore.requestWithoutAuthentication(request);
  };

const addLibraryHandler =
  ({ hdbCore }) =>
  async (request) => {
    const { name } = request.body;
    const { aud } = request.jwt;
    request.body = {
      operation: 'sql',
      sql: qb.buildInsertQuery('data.libraries', { name, user: aud }),
    };
    return hdbCore.requestWithoutAuthentication(request);
  };

module.exports = { getLibrariesHandler, addLibraryHandler, getLibraryHandler };
