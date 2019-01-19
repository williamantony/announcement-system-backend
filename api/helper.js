const uuid = require('uuid/v4');
const knex = require('../database/knex');

const successResponse = (data = {}, message = null) => ({
  data,
  error: null,
  message,
});

const errorResponse = (error = 'UNKNOWN_ERROR', message = null) => ({
  data: null,
  error,
  message,
});

const addUserLog = async (user_id = null, type = '', message = '') => {
  if (!user_id) return null;

  try {
    const newUserLog = {
      log_id: uuid(),
      user_id,
      type,
      message,
    };

    await knex('users_log').insert(newUserLog);
    console.log('Logged');

  } catch (error) {
    console.log('Error Logging');
  }
};

module.exports = {
  successResponse,
  errorResponse,
  addUserLog,
};
