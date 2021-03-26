require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const history = require('connect-history-api-fallback');
const config = require('./config/config');
const basicAuth = require("express-basic-auth");
const logger = require("../utilities/logger.js");

const app = express();
const log = logger.logger;

app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(
  helmet.hsts({
    maxAge: 31536000,
  }),
);

app.use(bodyParser.json());
app.use(cors());


/****************************************************************
 Instruct web browsers to disable caching
 ****************************************************************/
app.use(function (req, res, next) {
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate',
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

/****************************************************************
 Which environment
 ****************************************************************/
let isLocal = false;
let isDevelopment = false;
let isStaging = false;

if (process.env.NODE_ENV) {
  isLocal = "local" === process.env.NODE_ENV.toLowerCase();
  isDevelopment = "development" === process.env.NODE_ENV.toLowerCase();
  isStaging = "staging" === process.env.NODE_ENV.toLowerCase();
}

if (isLocal) log.info("Environment = local");
if (isDevelopment) log.info("Environment = development");
if (isStaging) log.info("Environment = staging");
if (!isLocal && !isDevelopment && !isStaging)
  log.info('server.js - ' + "Environment = staging or production");

/****************************************************************
 Setup basic auth for non-staging and non-production
 ****************************************************************/
if (isDevelopment || isStaging) {
  if (
    process.env.ELG_BASIC_AUTH_USER_NAME == null ||
    process.env.ELG_BASIC_AUTH_USER_PWD == null
  ) {
    log.error(
      "Either the basic ELG username or password environmental variable is not set."
    );
  }

  let user_json =
    '{"' +
    process.env.ELG_BASIC_AUTH_USER_NAME +
    '" : "' +
    process.env.ELG_BASIC_AUTH_USER_PWD +
    '"}';
  user_obj = JSON.parse(user_json);

  app.use(
    basicAuth({
      users: user_obj,
      challenge: true,
      unauthorizedResponse: getUnauthorizedResponse
    })
  );
}

function getUnauthorizedResponse(req) {
  return req.auth ? "Invalid credentials" : "No credentials provided";
}

//app.use(history());
require('./routes')(app,history());

app.listen(config.port);
console.log(`Server started on port ${config.port}`);
