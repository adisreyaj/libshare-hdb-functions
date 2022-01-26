'use strict';

const qb = require('./query-builder-helper');
const { hashPassword } = require('./users-helper');

const createUserHandler =
  ({ hdbCore }) =>
  async (request) => {
    const { firstName, lastName, email, password } = request.body;
    const hashedPass = await hashPassword(password);

    const sqlReq = {
      ...request,
      body: {
        operation: 'sql',
        sql: qb.buildInsertQuery('data.users', {
          firstName,
          lastName,
          email,
          password: hashedPass,
        }),
      },
    };

    return hdbCore.requestWithoutAuthentication(sqlReq);
  };

const getUserHandler =
  ({ hdbCore }) =>
  async (request) => {
    request.body = {
      operation: 'sql',
      sql: qb.buildGetQuery('data.users', ['firstName', 'lastName', 'email', 'id'], {
        where: {
          id: { type: qb.WHERE_TYPE.EQUAL, value: request.params.id },
        },
        limit: 1,
      }),
    };

    return hdbCore.requestWithoutAuthentication(request);
  };

module.exports = { createUserHandler, getUserHandler };
