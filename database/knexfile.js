const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
  path: path.join(__dirname, '../', '.env'),
});

const {
  MODE,
  DEV_DB_HOST,
  DEV_DB_USER,
  DEV_DB_PASS,
  DEV_DB_NAME,
  PROD_DB_HOST,
  PROD_DB_USER,
  PROD_DB_PASS,
  PROD_DB_NAME,
} = process.env;

const config = {
  development: {
    client: 'mysql',
    connection: {
      host : DEV_DB_HOST,
      user : DEV_DB_USER,
      password : DEV_DB_PASS,
      database : DEV_DB_NAME,
    },
  },
  production: {
    client: 'mysql',
    connection: {
      host : PROD_DB_HOST,
      user : PROD_DB_USER,
      password : PROD_DB_PASS,
      database : PROD_DB_NAME,
    },
  },
};

module.exports = MODE === 'DEV' ? config.development : config.production;
