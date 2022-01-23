'use strict';
const qb = require('./query-builder-helper');
const slugify = require('slugify');

const getListsHandler =
  ({ hdbCore }) =>
  async (request) => {
    request.body = {
      operation: 'sql',
      sql: qb.buildGetQuery(
        'data.lists',
        [
          'name',
          'description',
          'public',
          'id',
          'slug',
          'libraries',
          '__createdtime__ as createdAt',
          '__updatedtime__ as updatedAt',
        ],
        {
          where: {
            user: { type: qb.WHERE_TYPE.EQUAL, value: request.jwt.aud },
          },
          orderBy: 'name',
        },
      ),
    };
    return hdbCore.requestWithoutAuthentication(request);
  };

const getListHandler =
  ({ hdbCore }) =>
  async (request) => {
    request.body = {
      operation: 'sql',
      sql: qb.buildGetQuery(
        'data.lists',
        [
          'name',
          'description',
          'public',
          'id',
          'slug',
          'libraries',
          '__createdtime__ as createdAt',
          '__updatedtime__ as updatedAt',
        ],
        {
          where: {
            user: { type: qb.WHERE_TYPE.EQUAL, value: request.jwt.aud },
            id: { type: qb.WHERE_TYPE.EQUAL, value: request.params.id },
          },
          limit: 1,
        },
      ),
    };
    const [list] = await hdbCore.requestWithoutAuthentication(request);
    request.body = {
      operation: 'sql',
      sql: qb.buildGetQuery('data.libraries', ['name', 'id'], {
        where: {
          user: { type: qb.WHERE_TYPE.EQUAL, value: request.jwt.aud },
          id: { type: qb.WHERE_TYPE.IN, value: list.libraries ?? [] },
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
    const { name, public: isPublic, libraries, description } = request.body;
    const { aud } = request.jwt;
    request.body = {
      operation: 'sql',
      sql: qb.buildUpdateQuery(
        'data.lists',
        { name, public: isPublic, libraries, description },
        {
          where: {
            user: { type: qb.WHERE_TYPE.EQUAL, value: aud },
            id: { type: qb.WHERE_TYPE.EQUAL, value: request.params.id },
          },
        },
      ),
    };

    return hdbCore.requestWithoutAuthentication(request);
  };

const addListHandler =
  ({ hdbCore }) =>
  async (request) => {
    const { name, libraries, description, public: isPublic } = request.body;
    const { aud } = request.jwt;
    request.body = {
      operation: 'sql',
      sql: qb.buildInsertQuery('data.lists', {
        name,
        description,
        slug: slugify(name).toLowerCase(),
        user: aud,
        public: isPublic ?? false,
        libraries: libraries ?? [],
      }),
    };
    return hdbCore.requestWithoutAuthentication(request);
  };

const deleteListHandler =
  ({ hdbCore }) =>
  async (request) => {
    const { aud } = request.jwt;
    request.body = {
      operation: 'sql',
      sql: qb.buildDeleteQuery('data.lists', {
        where: {
          user: { type: qb.WHERE_TYPE.EQUAL, value: aud },
          id: { type: qb.WHERE_TYPE.EQUAL, value: request.params.id },
        },
      }),
    };
    return hdbCore.requestWithoutAuthentication(request);
  };

module.exports = {
  getListsHandler,
  addListHandler,
  getListHandler,
  updateListHandler,
  deleteListHandler,
};
