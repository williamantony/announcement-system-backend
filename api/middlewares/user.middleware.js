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

/**
 * Middleware that compares
 * user provided password with password hash stored in DB
 */
const comparePasswords = (req, res, next) => {
  const {
    password,
    passwordHash,
  } = req.body;
  
  bcrypt.compare(password, passwordHash)
    .then(matched => {
      
      if (matched) {
        req.body.user = req.body.user_id;
        delete req.body.user_id;
        return next();
      }

      res.json(errorResponse('WRONG_PASSWORD_ERROR'));

    })
    .catch(error => {
      res.json(errorResponse('BCRYPT_COMPARE_ERROR'));
    });

};

/**
 * Middleware for encrypting user id
 * during login
 */
const encryptUserData = (req, res, next) => {
  const { user } = req.body;

  const payload = {
    user,
  };

  const jwtOptions = {
    algorithm: 'HS256',
    expiresIn: '30 minutes',
  };

  jwt.sign(payload, JWT_SECRET, jwtOptions, (error, token) => {

    if (!error) {
      req.body.token = token;
      return next();
    }

    res.json(errorResponse('JWT_SIGN_ERROR'));

  });

};


/**
 * Middleware for decoding user id
 * from encrypted session token
 */
const decryptUserData = (req, res, next) => {
  const { token } = req.body;

  const jwtOptions = {
    algorithm: 'HS256',
  };

  jwt.verify(token, JWT_SECRET, jwtOptions, (error, decoded) => {

    if (!error) {
      req.body.decoded = decoded;
      return next();
    }

    res.json(errorResponse('JWT_VERIFICATION_ERROR'));

  });

};

module.exports = {
  // Sign Up
  hashPassword,
  
  // Login
  getPasswordByUsername,
  comparePasswords,
  encryptUserData,

  decryptUserData,
};
