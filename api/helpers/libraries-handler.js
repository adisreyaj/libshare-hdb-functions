'use strict';
const qb = require('./query-builder-helper');
const needle = require('needle');
const librariesHelper = require('./libraries-helper');
const errors = require('./errors-helper');

const SUGGESTIONS_API = `https://api.npms.io/v2/search/suggestions`;
const DETAILS_API = 'https://api.npms.io/v2/package';

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

const libraryMetadataHandler =
  ({ logger }) =>
  async (request, reply) => {
    const url = `${DETAILS_API}/${encodeURIComponent(request.params.libraryName)}`;
    try {
      const response = await needle('get', url);
      if (response.body?.collected) {
        return librariesHelper.formatLibraryMetaData(response.body);
      } else {
        errors.internalServerError(reply);
      }
    } catch (error) {
      logger.notify(`Error: ${error.message}`);
      errors.internalServerError(reply);
    }
  };

module.exports = {
  getLibrariesHandler,
  addLibraryHandler,
  getLibraryHandler,
  librarySuggestionsHandler,
  libraryMetadataHandler,
};
