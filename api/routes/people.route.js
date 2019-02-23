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
  processDeletePeopleRequest,
  deletePeople,
} = require('../middlewares/people.middleware');

const Router = express.Router();

/**
 * Add Person
 */
Router
  .route('/')
  .post(
    initiate,
    processNewPersonRequest,
    decryptUserData,
    createPerson,
    addPersonName,
  );

/**
 * Search People (list)
 */
Router
  .route('/')
  .get(
    initiate,
    processSearchPeopleRequest,
    decryptUserData,
    searchPeople,
  );

/**
 * Get Person Info
 */
Router
  .route('/:person_id')
  .get(
    initiate,
    processGetPersonInfoRequest,
    decryptUserData,
    getPersonInfo,
  );

/**
 * Delete People
 */
Router
  .route('/')
  .delete(
    initiate,
    processDeletePeopleRequest,
    decryptUserData,
    deletePeople,
  );

module.exports = Router;
