const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
  path: path.join(__dirname, '../', '.env'),
});

const {
  MAILGUN_API_KEY,
  MAILGUN_DOMAIN,
} = process.env;

const mailgun = require('mailgun-js')({
  apiKey: MAILGUN_API_KEY,
  domain: MAILGUN_DOMAIN,
});

module.exports = mailgun;
