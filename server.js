require('dotenv').config();

const {
  PORT,
  MODE,
} = process.env;

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');

const routes = require('./api/routes');

const server = express();

server.use(bodyParser.json());
server.use(cookieParser());
server.use(cors());
server.use(morgan('combined'));

routes(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${ PORT } in ${MODE} mode`);
});
