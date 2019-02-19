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
    fullname,
    firstname,
    lastname,
    middleInitial,
    preInitial,
    postInitial,
  } = req.body;

  console.log(token, fullname);

  if (token && fullname) {
    req._ = {
      ...req._,
      token,
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
  const { name } = req._;

  try {
    const newPerson = {
      person_id: uuid(),
      name: name.fullname,
    };
    req._.person_id = newPerson.person_id;

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

  } catch (error) {
    console.log(error);
    res.json(errorResponse('INSERT_ERROR'));
  }
};

module.exports = {
  initiate,
  processNewPersonRequest,
  createPerson,
  addPersonName,
};
