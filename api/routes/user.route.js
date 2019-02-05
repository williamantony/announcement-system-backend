const express = require('express');
const uuid = require('uuid/v4');
const knex = require('../../database/knex');
const { errorResponse } = require('../helper');

const {
  initiate,
  processSignUpRequest,
  createUser,
  savePrimaryUserInfo,
  processSetPasswordRequest,
  hashPassword,
  savePassword,
  encryptUserData,
  decryptUserData,
  processSignInRequest,
  getPasswordByUsername,
  comparePasswords,
  sendToken,
  processTokenVerification,
  processEmailVerification,
  checkNeedForPassword,
  sendEmailVerification,
} = require('../middlewares/user.middleware');

const Router = express.Router();

/**
 * @api {post} /user/ Create New User
 */
Router
  .route('/')
  .post(
    initiate,
    processSignUpRequest,
    encryptUserData,
    createUser,
    savePrimaryUserInfo,
    sendToken,
  );

Router
  .route('/send-verification/')
  .post(
    initiate,
    processEmailVerification,
    sendEmailVerification,
  );

Router
  .route('/verify')
  .post(
    initiate,
    processTokenVerification,
    decryptUserData,
    checkNeedForPassword,
  );

Router
  .route('/password')
  .post(
    initiate,
    processSetPasswordRequest,
    decryptUserData,
    hashPassword,
    savePassword,
  );

Router
  .route('/login')
  .post(
    initiate,
    processSignInRequest,
    getPasswordByUsername,
    comparePasswords,
    encryptUserData,
    sendToken,
  );

module.exports = Router