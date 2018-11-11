require('dotenv').config();

const {
  PORT,
} = process.env;

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const server = express();

server.use(bodyParser.json());
server.use(cors());
server.use(morgan('combined'));


server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${ PORT }`);
});
