'use strict';
const qb = require('./query-builder-helper');

const getListsHandler =
  ({ hdbCore }) =>
  async (request) => {
    request.body = {
      operation: 'sql',
      sql: qb.buildGetQuery('data.lists', ['name', 'id'], {
        where: {
          user: request.jwt.aud,
        },
        orderBy: 'name',
      }),
    };
    return hdbCore.requestWithoutAuthentication(request);
  };

const getListHandler =
  ({ hdbCore }) =>
  async (request) => {
    request.body = {
      operation: 'sql',
      sql: qb.buildGetQuery('data.lists', ['name', 'id'], {
        where: {
          user: request.jwt.id,
          id: request.params.id,
        },
        limit: 1,
      }),
    };
    return hdbCore.requestWithoutAuthentication(request);
  };

const updateListHandler =
  ({ hdbCore }) =>
  async (request) => {
    const { name, public: isPublic, bookmarks } = request.body;
    const { aud } = request.jwt;
    request.body = {
      operation: 'sql',
      sql: qb.buildUpdateQuery(
        'data.lists',
        { name, public: isPublic, bookmarks },
        {
          where: {
            user: aud,
            id: request.params.id,
          },
        },
      ),
    };
    return hdbCore.requestWithoutAuthentication(request);
  };

const addListHandler =
  ({ hdbCore }) =>
  async (request) => {
    const { name } = request.body;
    const { aud } = request.jwt;
    request.body = {
      operation: 'sql',
      sql: qb.buildInsertQuery('data.lists', { name, user: aud, public: false }),
    };
    return hdbCore.requestWithoutAuthentication(request);
  };

module.exports = { getListsHandler, addListHandler, getListHandler, updateListHandler };
