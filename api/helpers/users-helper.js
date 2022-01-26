'use strict';

const yup = require('yup');
const bcrypt = require('bcryptjs');
const errors = require('./errors-helper');
const qb = require('./query-builder-helper');

const hashPassword = async (password) => {
  try {
    const hashedPass = await bcrypt.hash(password, 8);
    return hashedPass;
  } catch (error) {
    return null;
  }
};

const USER_VALIDATION_SCHEMA = yup.object().shape({
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().required(),
});

const validateUser = (logger) => async (request, reply) => {
  try {
    await USER_VALIDATION_SCHEMA.validate(request.body);
    return true;
  } catch (error) {
    logger.error('Bad Request');
    errors.badRequest(reply);
  }
};

const existingUserValidation =
  ({ hdbCore }) =>
  async (request, reply) => {
    const email = request.body.email;
    const clonedReq = {
      ...request,
      body: {
        operation: 'sql',
        sql: qb.buildGetQuery('data.users', ['id'], {
          where: {
            email: { type: qb.WHERE_TYPE.EQUAL, value: email },
          },
          limit: 1,
        }),
      },
    };
    const [user] = await hdbCore.requestWithoutAuthentication(clonedReq);
    if (user != null) {
      return errors.badRequest(reply, 'User already exists');
    }
    return true;
  };

module.exports = {
  validateUser,
  hashPassword,
  existingUserValidation,
};
