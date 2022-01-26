'use strict';

const joi = require('joi');
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

const USER_VALIDATION_SCHEMA = joi.object({
  firstName: joi.string().required(),
  lastName: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
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
