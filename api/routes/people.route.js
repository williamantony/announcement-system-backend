const express = require('express');
const { decryptUserData } = require('../middlewares/user.middleware');
const {
  initiate,
  processNewPersonRequest,
  createPerson,
  addPersonName,
  processSearchPeopleRequest,
  searchPeople,
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
  .route('/')
  .get(
    initiate,
    processSearchPeopleRequest,
    decryptUserData,
    searchPeople,
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
