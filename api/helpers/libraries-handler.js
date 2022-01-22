'use strict';
const qb = require('./query-builder-helper');
const needle = require('needle');
const SUGGESTIONS_API = `https://api.npms.io/v2/search/suggestions`;

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

const librarySuggestionsHandler = () => async (request) => {
  const url = `${SUGGESTIONS_API}?q=${request.params.query}&size=5`;
  try {
    const response = await needle('get', url);
    return response.body ? response.body.map((result) => ({ name: result.package.name })) : [];
  } catch (error) {
    return [];
  }
};

module.exports = {
  getLibrariesHandler,
  addLibraryHandler,
  getLibraryHandler,
  librarySuggestionsHandler,
};
