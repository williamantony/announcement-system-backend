const path = require('path');
const dotenv = require('dotenv');
const uuid = require('uuid/v4');
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
const hashPassword = async (req, res, next) => {
  const { password } = req._;

  try {
    const hash = await bcrypt.hash(password, Number(BCRYPT_SALT_ROUNDS));
    req._.password = hash;
    return next();
  } catch (error) {
    res.json(errorResponse('BCRYPT_HASH_ERROR'));
  }
};

/**
 * Middleware to find user_id & password
 * from users database
 * based on provided username
 */
const getPasswordByUsername = async (req, res, next) => {
  const { username } = req.body;

  try {
    const response = await knex('users').select('user_id', 'password').where({ username });
    if (response.length === 1) {
      req.body.user_id = response[0].user_id;
      req.body.passwordHash = response[0].password;
      return next();
    } else {
      res.json(errorResponse('MULTI_USERNAME_ERROR'));
    }
  } catch (error) {
    res.json(errorResponse('GET_PWD_ERROR'));
  }
};

/**
 * Middleware that compares
 * user provided password with password hash stored in DB
 */
const comparePasswords = async (req, res, next) => {
  const { password, passwordHash } = req.body;
  
  try {
    const matched = await bcrypt.compare(password, passwordHash);
    if (matched) {
      req.body.user = req.body.user_id;
      delete req.body.user_id;
      return next();
    } else {
      res.json(errorResponse('WRONG_PASSWORD_ERROR'));
    }
  } catch (error) {
    res.json(errorResponse('BCRYPT_COMPARE_ERROR'));
  }
};

/**
 * Middleware for encrypting user id
 * during login
 */
const encryptUserData = async (req, res, next) => {
  const { user_id } = req._;

  try {
    const payload = {
      user_id,
    };
  
    const jwtOptions = {
      algorithm: 'HS256',
      expiresIn: '30 minutes',
    };
  
    const token = await jwt.sign(payload, JWT_SECRET, jwtOptions);
    
    if (token) {
      req._.token = token;
      return next();
    } else {
      res.json(errorResponse('JWT_SIGN_ERROR'));
    }    
  } catch (error) {
    res.json(errorResponse('ENCRYPT_DATA_ERROR'));
  }
};

/**
 * If all the previous steps of Login passes
 * it will send JWT Token back to the client
 */
const sendToken = (req, res) => {
  const { token } = req.body;
  res.json(successResponse({ token }));
};

/**
 * Middleware for decoding user id
 * from encrypted session token
 */
const decryptUserData = async (req, res, next) => {
  const { token } = req._;

  try {
    const jwtOptions = {
      algorithm: 'HS256',
    };

    const decoded = await jwt.verify(token, JWT_SECRET, jwtOptions);
    
    if (decoded) {
      req._.user_id = decoded.user_id;
      return next();
    } else {
      res.json(errorResponse('JWT_VERIFICATION_ERROR'));
    }
  } catch (error) {
    res.json(errorResponse('DECRYPT_DATA_ERROR'));
  }
};

module.exports = {
  // Sign Up
  hashPassword,
  
  // Login
  getPasswordByUsername,
  comparePasswords,
  encryptUserData,
  sendToken,

  decryptUserData,
};
