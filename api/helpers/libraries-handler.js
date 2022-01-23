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
      sql: qb.buildGetQuery(
        'data.libraries',
        [
          'id',
          'name',
          'description',
          'id',
          'github',
          'license',
          'npm',
          'version',
          'links',
          '__createdtime__ as createdAt',
        ],
        {
          where: {
            user: request.jwt.aud,
          },
          orderBy: 'name',
        },
      ),
    };
    return hdbCore.requestWithoutAuthentication(request);
  };

const getLibraryHandler =
  ({ hdbCore }) =>
  async (request) => {
    request.body = {
      operation: 'sql',
      sql: qb.buildGetQuery(
        'data.libraries',
        [
          'id',
          'name',
          'description',
          'id',
          'github',
          'license',
          'npm',
          'version',
          'links',
          '__createdtime__ as createdAt',
        ],
        {
          where: {
            user: request.jwt.id,
            id: request.params.id,
          },
          limit: 1,
        },
      ),
    };
    return hdbCore.requestWithoutAuthentication(request);
  };

const addLibraryHandler =
  ({ hdbCore, logger }) =>
  async (request) => {
    const { name, description, github, license, links, npm, version } = request.body;
    const { aud } = request.jwt;
    request.body = {
      operation: 'sql',
      sql: qb.buildInsertQuery('data.libraries', {
        name,
        description,
        github,
        license,
        links,
        npm,
        version,
        user: aud,
      }),
    };
    logger.notify('Executing query:', request.body.sql);
    return hdbCore.requestWithoutAuthentication(request);
  };

const updateLibraryHandler =
  ({ hdbCore }) =>
  async (request) => {
    const { aud } = request.jwt;
    const { name, description, github, license, links, npm, version } = request.body;
    request.body = {
      operation: 'sql',
      sql: qb.buildUpdateQuery(
        'data.libraries',
        {
          name,
          description,
          github,
          license,
          links,
          npm,
          version,
        },
        {
          where: {
            id: request.params.id,
            user: aud,
          },
        },
      ),
    };

    return hdbCore.requestWithoutAuthentication(request);
  };

const deleteLibraryHandler =
  ({ hdbCore }) =>
  async (request) => {
    const { aud } = request.jwt;
    request.body = {
      operation: 'sql',
      sql: qb.buildDeleteQuery('data.libraries', {
        where: {
          id: request.params.id,
          user: aud,
        },
      }),
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
  updateLibraryHandler,
  deleteLibraryHandler,
};
