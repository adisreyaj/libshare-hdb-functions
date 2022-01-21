const boom = require('@hapi/boom');

const internalServerError = (reply, message = 'Internal server error') => {
  const error = boom.internal(message);
  return reply.code(error.output.statusCode).send(error.output.payload);
};

const badRequest = (reply, message = 'Bad request') => {
  const error = boom.badRequest(message);
  return reply.code(error.output.statusCode).send(error.output.payload);
};

const unAuthorized = (reply, message = 'Unauthorized') => {
  const error = boom.unauthorized(message);
  return reply.code(error.output.statusCode).send(error.output.payload);
};

module.exports = {
  internalServerError,
  badRequest,
  unAuthorized,
};
