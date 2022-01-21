'use strict';

const qb = require('./query-builder.helper');
const errors = require('./errors.helper');
const authHelpers = require('./auth.helper');
const loginHandler =
  ({ hdbCore, logger }) =>
  async (request, reply) => {
    const credentials = request.body;
    request.body = {
      operation: 'sql',
      sql: qb.buildGetQuery('data.users', ['id', 'email', 'password'], { limit: 1 }),
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
    };
  };

module.exports = {
  loginHandler,
};
