const uuid = require('uuid/v4');
const knex = require('../../database/knex');
const {
  successResponse,
  errorResponse,
  parseJSON,
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

const processSearchPeopleRequest = (req, res, next) => {
  const { token, filter, limit, offset } = req.query;
  
  if (token) {
    req._ = {
      ...req._,
      token,
      filter: filter || {},
      limit: limit || 10,
      offset: offset || 0,
    };

    return next();
  }

  res.json(errorResponse('MISSING_REQ_PARAMS'));
  return;
};

const searchPeople = async (req, res, next) => {
  const { filter, limit, offset } = req._;

  try {
    let response = [];

    const queryWhere = Object.keys(filter).reduce((query, name) => {
      const nameQuery = `LOWER(\`name\`) like LOWER('%${ name }%')`;
      const valueQuery = `and LOWER(\`value\`) like LOWER('%${ filter[name] }%')`;
      return `${ query } ${ nameQuery } ${ valueQuery }`.trim();
    }, '');

    response = await knex('people_data')
      .distinct('person_id')
      .select('person_id', 'name', 'value')
      .whereRaw(queryWhere)
      .limit(limit)
      .offset(offset);

    if (response.length > 0) {
      response = response.reduce((rows, row) => {
        return {
          ...rows,
          [row.person_id]: {
            ...rows[row.person_id],
            [row.name]: parseJSON(row.value),
          },
        };
      }, {});
    }

    res.json(successResponse(response));
    console.log(response);
  }
  catch (error) {
    console.log(error);
    res.json(errorResponse('SEARCH_PEOPLE_ERROR'));
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
        rows[row.name] = parseJSON(row.value);
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
  processSearchPeopleRequest,
  searchPeople,
  processGetPersonInfoRequest,
  getPersonInfo,
};
