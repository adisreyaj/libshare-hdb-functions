'use strict';
const qb = require('./query-builder-helper');
const slugify = require('slugify');

const getListsHandler =
  ({ hdbCore }) =>
  async (request) => {
    request.body = {
      operation: 'sql',
      sql: qb.buildGetQuery('data.lists', ['name', 'id', 'slug', 'libraries'], {
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
      sql: qb.buildGetQuery('data.lists', ['name','slug', 'id', 'libraries'], {
        where: {
          user: request.jwt.aud,
          id: request.params.id,
        },
        limit: 1,
      }),
    };
    const [list] = await hdbCore.requestWithoutAuthentication(request);
    request.body = {
      operation: 'sql',
      sql: qb.buildGetQuery('data.libraries', ['name', 'id'], {
        where: {
          user: request.jwt.aud,
          id: list.libraries ?? [],
        },
      }),
    };

    const libraries = await hdbCore.requestWithoutAuthentication(request);
    list.libraries = libraries ?? [];
    return list;
  };

const updateListHandler =
  ({ hdbCore }) =>
  async (request) => {
    const { name, public: isPublic, libraries } = request.body;
    const { aud } = request.jwt;
    request.body = {
      operation: 'sql',
      sql: qb.buildUpdateQuery(
        'data.lists',
        { name, public: isPublic, libraries },
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
    const { name, libraries, public: isPublic } = request.body;
    const { aud } = request.jwt;
    request.body = {
      operation: 'sql',
      sql: qb.buildInsertQuery('data.lists', {
        name,
        slug: slugify(name).toLowerCase(),
        user: aud,
        public: isPublic ?? false,
        libraries: libraries ?? [],
      }),
    };
    return hdbCore.requestWithoutAuthentication(request);
  };

module.exports = { getListsHandler, addListHandler, getListHandler, updateListHandler };
