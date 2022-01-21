const { buildInsertQuery, buildGetQuery } = require('./query-builder.helper');
const { hashPassword } = require('./users.helper');

const createUserHandler =
  ({ hdbCore }) =>
  async (request) => {
    const { firstName, lastName, email, password } = request.body;
    const hashedPass = await hashPassword(password);
    request.body = {
      operation: 'sql',
      sql: buildInsertQuery('data.users', { firstName, lastName, email, password: hashedPass }),
    };
    return hdbCore.requestWithoutAuthentication(request);
  };

const getUsersHandler =
  ({ hdbCore }) =>
  async (request) => {
    request.body = {
      operation: 'sql',
      sql: buildGetQuery('data.users', ['firstName', 'lastName', 'email', 'id']),
    };
    return hdbCore.requestWithoutAuthentication(request);
  };

module.exports = { createUserHandler, getUsersHandler };
