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

/**
 * Middleware to find user_id & password
 * from users database
 * based on provided username
 */
const getPasswordByUsername = (req, res, next) => {
  const { username } = req.body;

  knex('users')
    .select('user_id', 'password')
    .where({ username })
    .then(response => {

      if (response.length === 1) {
        req.body.user_id = response[0].user_id;
        req.body.passwordHash = response[0].password;
        return next();
      }

      res.json(errorResponse('MULTI_USERNAME_ERROR'));

    });

};

module.exports = {
  // Sign Up
  hashPassword,
  
  // Login
  getPasswordByUsername,
};
