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

module.exports = {
  initiate,
  processNewPersonRequest,
};
