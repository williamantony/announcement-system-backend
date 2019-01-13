require('dotenv').config();

const db = require('./knexfile.js');
const knex = require('knex');

const { MODE } = process.env;
const config = MODE === 'DEV' ? db.development : db.production;

module.exports = knex(config);
