'use strict';

const joi = require('joi');
const errors = require('./errors-helper');

const COMMON_VALIDATOR = {
  description: joi.string(),
  public: joi.boolean(),
  libraries: joi.array().items(
    joi.object({
      id: joi.string().required(),
      name: joi.string().required(),
      description: joi.string(),
      image: joi.string(),
    }),
  ),
};
const NEW_LIST_VALIDATOR_SCHEMA = joi.object({
  name: joi.string().required(),
  ...COMMON_VALIDATOR,
});

const UPDATE_LIST_VALIDATOR_SCHEMA = joi.object({
  name: joi.string(),
  ...COMMON_VALIDATOR,
});

const validateNewList = (logger) => async (request, reply) => {
  try {
    await NEW_LIST_VALIDATOR_SCHEMA.validate(request.body);
    return true;
  } catch (error) {
    logger.error('Bad Request');
    errors.badRequest(reply);
  }
};

const validateUpdateList = (logger) => async (request, reply) => {
  try {
    await UPDATE_LIST_VALIDATOR_SCHEMA.validate(request.body);
    return true;
  } catch (error) {
    logger.error('Bad Request');
    errors.badRequest(reply);
  }
};

module.exports = {
  validateNewList,
  validateUpdateList,
};
