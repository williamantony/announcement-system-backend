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

Router.delete('/', (req, res) => {
  const { event_id } = req.body;

  knex('events')
    .where({ event_id })
    .delete()
    .then(deleteCount => {
      
      if (deleteCount === 1) {

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
    
      } else {

        res.json({
          data: {},
          status: {
            hasError: true,
            error: 'DELETE_ERROR:NOT_FOUND',
            message: '',
          },
        });

      }

    })
    .catch(deleteError => {

      res.json({
        data: {},
        status: {
          hasError: true,
          error: 'DELETE_ERROR',
          message: '',
        },
      });

    });

});

module.exports = Router;
