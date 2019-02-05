const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const uuid = require('uuid/v4');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const knex = require('../../database/knex');
const mailgun = require('../../mailer/mailgun');
const {
  errorResponse,
  successResponse,
  addUserLog,
} = require('../helper');

dotenv.config({
  path: path.join(__dirname, '../../.env'),
});

const {
  BCRYPT_SALT_ROUNDS,
  JWT_SECRET,
} = process.env;

/**
 * Initiate API
 */
const initiate = (req, res, next) => {
  req._ = {};
  return next();
};

/**
 * Process required params
 * for the next middlewares
 */
const processSignUpRequest = (req, res, next) => {
  const { email, firstname, lastname } = req.body;

  if (email && firstname && lastname) {
    req._ = {
      ...req._,
      user_id: uuid(),
      email,
      firstname,
      lastname,
    };

    return next();
  }

  res.json(errorResponse('MISSING_REQ_PARAMS'));
  return;
};

/**
 * Create new User with email address
 */
const createUser = async (req, res, next) => {
  const { user_id, email } = req._;

  try {
    const newUser = {
      user_id,
      username: email,
      email,
      password: '',
    };

    await knex('users').insert(newUser);
    
    return next();
  } catch (error) {
    res.json(errorResponse('INSERT_ERROR'));
  }
};

/**
 * Save info related to new User
 */
const savePrimaryUserInfo = async (req, res, next) => {
  const {
    user_id,
    email,
    firstname,
    lastname,
  } = req._;

  try {
    const nameEntry = {
      data_id: uuid(),
      user_id,
      name: 'name',
      value: JSON.stringify({
        firstname,
        lastname,
      }),
    };

    const emailEntry = {
      data_id: uuid(),
      user_id,
      name: 'email',
      value: JSON.stringify({
        type: 'primary',
        email,
      }),
    };

    await knex('users_data').insert([ nameEntry, emailEntry ]);

    addUserLog(
      user_id,
      'signin',
      'user registered with email, firstname & lastname',
    );

    // res.json(successResponse());
    return next();
  } catch (error) {
    console.log(error);
    res.json(errorResponse('SAVE_DATA_ERROR'));
  }
};

/**
 * Process required params
 * for the next middlewares
 */
const processSetPasswordRequest = (req, res, next) => {
  const { password, token } = req.body;

  if (password && token) {
    req._.password = password;
    req._.token = token;
    return next();
  }

  res.json(errorResponse('MISSING_REQ_PARAMS'));
  return;
};

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
 * Save user's password
 * after signup or while changing password
 */
const savePassword = async (req, res, next) => {
  const { user_id, password } = req._;

  try {
    await knex('users').update({ password }).where({ user_id });
    res.json(successResponse());
    return next();
  } catch (error) {
    res.json(errorResponse('SAVE_PWD_ERROR'));
  }
};

/**
 * Process required params
 * for the next middlewares
 */
const processTokenVerification = (req, res, next) => {
  const { token } = req.body;

  if (token) {
    req._.token = token;
    return next();
  }

  res.json(errorResponse('MISSING_REQ_PARAMS'));
  return;
};

/**
 * Check whether a there is a need for password
 * typical check for new users
 */
const checkNeedForPassword = async (req, res, next) => {
  const { user_id } = req._;

  try {
    const response = await knex('users').select('password').where({ user_id });
    let hasPassword = false;
    if (response.length > 0) {
      hasPassword = response[0].password !== '';
    }
    req._.hasPassword = hasPassword;
    res.json(successResponse({
      hasPassword,
      verified: true,
    }));
    return next();
  } catch (error) {
    res.json(errorResponse('CHK_PWD_ERROR'));
  }
};

/**
 * Process required params
 * for the next middlewares
 */
const processSignInRequest = (req, res, next) => {
  const { username, password } = req.body;

  if (username && password) {
    req._.username = username;
    req._.password = password;
    return next();
  }

  res.json(errorResponse('MISSING_REQ_PARAMS'));
  return;
};

/**
 * Middleware to find user_id & password
 * from users database
 * based on provided username
 */
const getPasswordByUsername = async (req, res, next) => {
  const { username } = req._;

  try {
    const response = await knex('users').select('user_id', 'password').where({ username });
    if (response.length === 1) {
      req._.user_id = response[0].user_id;
      req._.passwordHash = response[0].password;
      return next();
    } else {
      res.json(errorResponse('INVALID_USERNAME_ERROR'));
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
  const { password, passwordHash } = req._;
  
  try {
    const matched = await bcrypt.compare(password, passwordHash);
    if (matched) {
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
  const { token, user_id } = req._;
  res.json(successResponse({ token, user_id }));
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

/**
 * Process required params
 * for the next middlewares
 */
const processEmailVerification = (req, res, next) => {
  const { firstname, email, token } = req.body;

  if (email && token) {
    req._ = {
      firstname,
      email,
      token,
    };

    return next();
  }

  res.json(errorResponse('MISSING_REQ_PARAMS'));
  return;
};

/**
 * Sends Email with verification link
 * for newly registered account holders
 */
const sendEmailVerification = async (req, res, next) => {
  try {
    const { firstname, email, token } = req._;
    const verificationUrl = `http://localhost:3000/verify/${ token }`;

    const htmlTemplatePath = path.join(__dirname, '../../mailer/templates/verifyEmailTemplate.html');
    const textTemplatePath = path.join(__dirname, '../../mailer/templates/verifyEmailTemplate.txt');

    const getHtmlTemplate = () => {
      return new Promise((resolve, reject) => {
        fs.readFile(htmlTemplatePath, 'utf8', (err, data) => err ? reject(err) : resolve(data));
      });
    };

    const getTextTemplate = () => {
      return new Promise((resolve, reject) => {
        fs.readFile(textTemplatePath, 'utf8', (err, data) => err ? reject(err) : resolve(data));
      });
    };

    let htmlTemplate = await getHtmlTemplate();
    let textTemplate = await getTextTemplate();

    htmlTemplate = htmlTemplate
      .replace(/\[\[\[\_ACCOUNT_EMAIL\_\]\]\]/gi, email)
      .replace(/\[\[\[\_ACCOUNT_FIRSTNAME\_\]\]\]/gi, firstname)
      .replace(/\[\[\[\_VERIFICATION\_URL\_\]\]\]/gi, verificationUrl);

    textTemplate = textTemplate
      .replace(/\[\[\[\_ACCOUNT_EMAIL\_\]\]\]/gi, email)
      .replace(/\[\[\[\_ACCOUNT_FIRSTNAME\_\]\]\]/gi, firstname)
      .replace(/\[\[\[\_VERIFICATION\_URL\_\]\]\]/gi, verificationUrl);

    const emailConfig = {
      from: 'International Pentecostal Assembly <postmaster@email.ipachicago.org>',
      to: email,
      subject: 'Account Activation - IPA Chicago',
      text: textTemplate,
      html: htmlTemplate,
    };

    mailgun.messages().send(emailConfig, (error, body) => {
      if (error) {
        res.json(errorResponse('EMAIL_SENDING_ERROR'));
        return;
      }
      res.json(successResponse({
        success: true,
        body,
      }));
    });
    
  } catch (error) {
    res.json(errorResponse('SEND_EMAIL_VERIFICATION_ERROR'));
  }
};

module.exports = {
  initiate,
  decryptUserData,

  // Sign Up
  processSignUpRequest,
  createUser,
  savePrimaryUserInfo,

  // Set Password
  processSetPasswordRequest,
  hashPassword,
  savePassword,

  // Login
  processSignInRequest,
  getPasswordByUsername,
  comparePasswords,
  encryptUserData,
  sendToken,

  // Email Verification
  processEmailVerification,
  sendEmailVerification,

  // Verify Token
  processTokenVerification,
  checkNeedForPassword,
};
