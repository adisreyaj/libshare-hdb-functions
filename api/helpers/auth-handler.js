'use strict';

const qb = require('./query-builder-helper');
const errors = require('./errors-helper');
const authHelpers = require('./auth-helper');
const loginHandler =
  ({ hdbCore, logger }) =>
  async (request, reply) => {
    const credentials = request.body;
    request.body = {
      operation: 'sql',
      sql: qb.buildGetQuery('data.users', ['id', 'firstName', 'lastName', 'email', 'password'], {
        limit: 1,
        where: {
          email: { type: qb.WHERE_TYPE.EQUAL, value: credentials.email },
        },
      }),
    };
    const result = await hdbCore.requestWithoutAuthentication(request);
    if (result.length === 0) {
      return errors.unAuthorized(reply);
    }
    const isPasswordValid = await authHelpers.validatePassword(
      credentials.password,
      result[0].password,
    );
    if (!isPasswordValid) {
      logger.notify('Invalid password');
      return errors.unAuthorized(reply);
    }
    const token = await authHelpers.generateToken(logger, reply)(result[0]);
    return {
      token,
      user: {
        id: result[0].id,
        firstName: result[0].firstName,
        lastName: result[0].lastName,
        email: result[0].email,
      },
    };
  };

const getUserHandler =
  ({ hdbCore }) =>
  async (request, reply) => {
    request.body = {
      operation: 'sql',
      sql: qb.buildGetQuery('data.users', ['id', 'firstName', 'lastName', 'email'], {
        limit: 1,
        where: {
          id: { type: qb.WHERE_TYPE.EQUAL, value: request.jwt.aud },
        },
      }),
    };
    const result = await hdbCore.requestWithoutAuthentication(request);
    if (result?.length > 0) {
      return result[0];
    }
    return errors.notFound(reply);
  };

module.exports = {
  loginHandler,
  getUserHandler,
};
