const jwt = require('jsonwebtoken');
const yup = require('yup');
const bcrypt = require('bcryptjs');
const errors = require('./errors.helper');
require('dotenv').config({
  path: `${__dirname}/../.env`,
});

const authenticationCheck = (logger) => async (request, reply) => {
  try {
    const token = request.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch (error) {
    logger.error('Unauthorized');
    errors.unAuthorized(reply);
  }
};

const generateToken = (logger, reply) => async (user) => {
  try {
    logger.notify(`Token (${JSON.stringify(process.env.JWT_SECRET)})`);
    const token = jwt.sign(
      {
        email: user.email,
        aud: user.email,
        iss: 'https://libshare.adi.so',
        sub: 'libshare-web',
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
    );
    return token;
  } catch (error) {
    logger.notify(`Failed to generate token. Err: ${error}`);
    errors.internalServerError(reply);
  }
};

const validatePassword = async (password, savedPassword) => {
  try {
    return await bcrypt.compare(password, savedPassword);
  } catch (error) {
    return false;
  }
};

const LOGIN_VALIDATION_SCHEMA = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

const validateLoginBody = (logger) => async (request, reply) => {
  try {
    await LOGIN_VALIDATION_SCHEMA.validate(request.body);
    return true;
  } catch (error) {
    logger.error('Bad Request');
    errors.badRequest(reply);
  }
};

module.exports = {
  authenticationCheck,
  validateLoginBody,
  generateToken,
  validatePassword,
};
