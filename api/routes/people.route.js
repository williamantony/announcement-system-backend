const express = require('express');
const { decryptUserData } = require('../middlewares/user.middleware');
const {
  initiate,
  processNewPersonRequest,
  createPerson,
  addPersonName,
  processGetPersonInfoRequest,
  getPersonInfo,
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

Router
  .route('/:person_id')
  .get(
    initiate,
    processGetPersonInfoRequest,
    decryptUserData,
    getPersonInfo,
  );

module.exports = Router;
