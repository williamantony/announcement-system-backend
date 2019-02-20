const uuid = require('uuid/v4');
const knex = require('../../database/knex');
const {
  successResponse,
  errorResponse
} = require('../helper');

/**
 * Initiate API
 */
const initiate = (req, res, next) => {
  req._ = {};
  return next();
};

const processNewPersonRequest = (req, res, next) => {
  const {
    token,
    person_id,
    fullname,
    firstname,
    lastname,
    middleInitial,
    preInitial,
    postInitial,
  } = req.body;

  if (token && person_id && fullname) {
    req._ = {
      ...req._,
      token,
      person_id,
      name: {
        fullname,
        firstname,
        lastname,
        middleInitial,
        preInitial,
        postInitial,
      },
    };

    return next();
  }

  res.json(errorResponse('MISSING_REQ_PARAMS'));
  return;
};

const createPerson = async (req, res, next) => {
  const { person_id, name } = req._;

  try {
    const newPerson = {
      person_id,
      name: name.fullname,
    };

    await knex('people').insert(newPerson);
    return next();

  } catch (error) {
    res.json(errorResponse('INSERT_ERROR'));
  }
};

const addPersonName = async (req, res, next) => {
  const { person_id, name } = req._;

  try {
    const nameEntry = {
      data_id: uuid(),
      person_id,
      name: 'name',
      value: JSON.stringify(name),
    };

    await knex('people_data').insert(nameEntry);
    res.json(successResponse({
      person_id,
    }));
  }
  catch (error) {
    res.json(errorResponse('INSERT_ERROR'));
  }
};

const processGetPersonInfoRequest = (req, res, next) => {
  const { person_id } = req.params;
  const { token, returns } = req.query;
  
  if (token && person_id) {
    req._ = {
      ...req._,
      token,
      person_id,
      returns: returns || [],
    };

    return next();
  }

  res.json(errorResponse('MISSING_REQ_PARAMS'));
  return;
};

const getPersonInfo = async (req, res, next) => {
  const {
    person_id,
    returns,
  } = req._;
  
  try {
    let response = [];

    if (returns.length === 0) {
      response = await knex('people_data')
        .select('name', 'value')
        .where({ person_id });
    } else {
      response = await knex('people_data')
        .select('name', 'value')
        .where({ person_id })
        .whereIn('name', returns);
    }

    if (response.length > 0) {
      response = response.reduce((rows, row) => {
        rows[row.name] = JSON.parse(row.value);
        return rows;
      }, {});
    }

    res.json(successResponse(response));
  }
  catch (error) {
    res.json(errorResponse('GET_PERSON_ERROR'));
  }
};

module.exports = {
  initiate,
  processNewPersonRequest,
  createPerson,
  addPersonName,
  processGetPersonInfoRequest,
  getPersonInfo,
};
