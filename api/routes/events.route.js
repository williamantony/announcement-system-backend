const express = require('express');
const uuid = require('uuid/v4');
const knex = require('../../database/knex');
const { errorResponse } = require('../helper');

const Router = express.Router();

/**
 * @api {post} /events/ Initiate New Event
 */
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
      res.json(errorResponse('INSERT_ERROR'));
    });
  
});

/**
 * @api {put} /events/:event_id Update Event Title
 */
Router.put('/:event_id', (req, res) => {
  const { event_id } = req.params;
  const { title } = req.body;

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
      res.json(errorResponse('UPDATE_ERROR'));
    });

});

/**
 * @api {delete} /events/:event_id Delete a specific event
 */
Router.delete('/:event_id', (req, res) => {
  const { event_id } = req.param;

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
        res.json(errorResponse('DELETE_ERROR:NOT_FOUND'));
      }

    })
    .catch(deleteError => {
      res.json(errorResponse('DELETE_ERROR'));
    });

});

/**
 * @api {get} /events Request all events
 */
Router.get('/', (req, res) => {

  knex('events')
    .select(['event_id', 'title', 'note'])
    .then(response => {

      res.json({
        data: {
          events: response,
        },
        status: {
          hasError: false,
          error: null,
          message: '',
        },
      });

    })
    .catch(selectError => {
      res.json(errorResponse('SELECT_ERROR'));
    });

});

/**
 * @api {get} /events/:event_id Request Event Details
 */
Router.get('/:event_id', (req, res) => {
  const { event_id } = req.params;

  knex('events')
    .join('events_sessions', 'events.event_id', '=', 'events_sessions.event_id')
    .where({ 'events.event_id': event_id })
    .then(response => {

      const {
        title,
        note,
      } = response[0];

      const event = {
        id: event_id,
        title,
        note,
        sessions: response.reduce((sessions, thisSession) => {
          return [
            ...sessions,
            {
              id: thisSession.session_id,
              date: thisSession.date,
              time: thisSession.time,
              note: thisSession.note,
            },
          ];
        }, []),
      };

      res.json({
        data: {
          event,
        },
        status: {
          hasError: false,
          error: null,
          message: '',
        },
      });

    })
    .catch(selectError => {
      res.json(errorResponse('SELECT_ERROR'));
    });

});

/**
 * @api {post} /events/:event_id/sessions Create Session
 */
Router.post('/:event_id/sessions', (req, res) => {
  const { event_id } = req.params;
  const { date } = req.body;
  const session_id = uuid();

  knex('events_sessions')
    .insert({
      session_id,
      event_id,
      date,
    })
    .then(() => {

      res.json({
        data: {
          event: {
            session_id,
            id: event_id,
            date,
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
      res.json(errorResponse('INSERT_ERROR'));
    });
});

/**
 * @api {put} /events/sessions/:session_id Update Session Time
 */
Router.put('/sessions/:session_id', (req, res) => {
  const { session_id } = req.params;
  const { time } = req.body;

  knex('events_sessions')
    .where({ session_id })
    .update({ time })
    .then(() => {

      res.json({
        data: {
          session: {
            id: session_id,
            time,
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
      res.json(errorResponse('UPDATE_ERROR'));
    });
});

module.exports = Router;
