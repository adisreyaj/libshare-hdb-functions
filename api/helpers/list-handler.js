'use strict';
const qb = require('./query-builder-helper');
const slugify = require('slugify');
const errors = require('./errors-helper');
const { customAlphabet, urlAlphabet } = require('nanoid');
const nanoid = customAlphabet(urlAlphabet, 10);

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

const getListBySlugHandler =
  ({ hdbCore }) =>
  async (request, reply) => {
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
          'user',
          '__createdtime__ as createdAt',
          '__updatedtime__ as updatedAt',
        ],
        {
          where: {
            slug: { type: qb.WHERE_TYPE.EQUAL, value: request.params.slug },
          },
          limit: 1,
        },
      ),
    };
    const [list] = await hdbCore.requestWithoutAuthentication(request);
    if (!list) {
      return errors.notFound(reply, 'List not found');
    }
    if (!list.public) {
      return errors.unAuthorized(reply, 'List is not public');
    }
    const userReq = getUserRequest(request, list.user);
    const librariesReq = getLibrariesRequest(list, request, list.user);
    try {
      const [libraries, user] = await Promise.all([
        hdbCore.requestWithoutAuthentication(librariesReq),
        hdbCore.requestWithoutAuthentication(userReq),
      ]);
      list.libraries = libraries ?? [];
      list.user = user[0] ?? {};
      return list;
    } catch (e) {
      errors.internalServerError(reply);
    }
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
        slug: slugify(`${name}-${nanoid()}`).toLowerCase(),
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
  getListBySlugHandler,
  addListHandler,
  getListHandler,
  updateListHandler,
  deleteListHandler,
};
function getUserRequest(request, userId) {
  return {
    ...request,
    body: {
      operation: 'sql',
      sql: qb.buildGetQuery('data.users', ['firstName', 'lastName', 'email', 'id'], {
        where: {
          id: { type: qb.WHERE_TYPE.EQUAL, value: userId },
        },
        limit: 1,
      }),
    },
  };
}

function getLibrariesRequest(list, request, userId) {
  const listIds = (list.libraries ?? [])?.map((list) => list.id);
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
          user: { type: qb.WHERE_TYPE.EQUAL, value: userId },
          id: { type: qb.WHERE_TYPE.IN, value: listIds },
        },
      },
    ),
  };
  return request;
}
