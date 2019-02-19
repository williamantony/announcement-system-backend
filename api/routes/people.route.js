const express = require('express');
const { decryptUserData } = require('../middlewares/user.middleware');
const {
  initiate,
  processNewPersonRequest,
  createPerson,
  addPersonName,
} = require('../middlewares/people.middleware');

const Router = express.Router();

Router
  .route('/')
  .post(
    initiate,
    processNewPersonRequest,
    decryptUserData,
    createPerson,
    addPersonName,
  );

module.exports = Router;
