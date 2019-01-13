require('dotenv').config();

const {
  DEV_DB_FILE,
  PROD_DB_HOST,
  PROD_DB_USER,
  PROD_DB_PASS,
  PROD_DB_NAME,
} = process.env;

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './db.sqlite3',
    },
    useNullAsDefault: true,
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
