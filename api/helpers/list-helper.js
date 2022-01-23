'use strict';

const yup = require('yup');
const errors = require('./errors-helper');

const NEW_LIST_VALIDATOR_SCHEMA = yup.object().shape({
  name: yup.string().required(),
  description: yup.string(),
  public: yup.boolean(),
  libraries: yup.array().of(
    yup.object().shape({
      id: yup.string().required(),
      name: yup.string().required(),
      description: yup.string(),
      image: yup.string().url(),
    }),
  ),
});

const UPDATE_LIST_VALIDATOR_SCHEMA = NEW_LIST_VALIDATOR_SCHEMA.shape({
  name: yup.string(),
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
