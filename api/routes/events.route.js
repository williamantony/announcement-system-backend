const express = require('express');
const uuid = require('uuid/v4');
const knex = require('../../database/knex');

const Router = express.Router();

Router.post('/', (req, res) => {

  knex('events')
    .insert({
      event_id: uuid(),
    })
    .then(() => {

      res.json({
        data: {
          event: {
            id: event_id,
          },
        },
        status: {
          hasError: false,
          error: null,
          message: '',
        },
      });

    })
    .catch(insertError => {

      res.json({
        data: {},
        status: {
          hasError: true,
          error: 'INSERT_ERROR',
          message: '',
        },
      });

    });
  
});

Router.put('/', (req, res) => {
  const {
    event_id,
    title,
  } = req.body;

  knex('events')
    .where({ event_id })
    .update({ title })
    .then(() => {

      res.json({
        data: {
          event: {
            id: event_id,
            title,
          },
        },
        status: {
          hasError: false,
          error: null,
          message: '',
        },
      });

    })
    .catch(updateError => {

      res.json({
        data: {},
        status: {
          hasError: true,
          error: 'UPDATE_ERROR',
          message: '',
        },
      });

    });

});

module.exports = Router;
