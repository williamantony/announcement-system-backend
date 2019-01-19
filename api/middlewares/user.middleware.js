const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const knex = require('../../database/knex');
const {
  errorResponse,
  successResponse,
} = require('../helper');

dotenv.config({
  path: path.join(__dirname, '../../.env'),
});

const {
  BCRYPT_SALT_ROUNDS,
  JWT_SECRET,
} = process.env;

/**
 * Middleware for hashing passwords
 * during signup and password changes.
 */
const hashPassword = (req, res, next) => {

  bcrypt.hash(req.body.password, Number(BCRYPT_SALT_ROUNDS))
    .then(hash => {
      req.body.password = hash;
      return next();
    })
    .catch((error) => {
      res.json(errorResponse('BCRYPT_HASH_ERROR'));
    });

};

module.exports = {
  // Sign Up
  hashPassword,
};
