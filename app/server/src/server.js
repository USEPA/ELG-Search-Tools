require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const history = require('connect-history-api-fallback');
const config = require('./config/config');
const basicAuth = require('express-basic-auth');
const logger = require('../utilities/logger.js');

const app = express();
const log = logger.logger;

const { retrieveFileFromS3, uploadFileToS3 } = require('./s3/aws-s3.js');
const fs = require('fs');
const path = require('path');
const https = require('https');

app.disable('x-powered-by');

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(
  helmet.hsts({
    maxAge: 31536000,
  })
);

app.use(bodyParser.json());
app.use(cors());

/****************************************************************
 Instruct web browsers to disable caching
 ****************************************************************/
app.use(function(req, res, next) {
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
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
  isLocal = 'local' === process.env.NODE_ENV.toLowerCase();
  isDevelopment = 'development' === process.env.NODE_ENV.toLowerCase();
  isStaging = 'staging' === process.env.NODE_ENV.toLowerCase();
}

if (isLocal) log.info('Environment = local');
if (isDevelopment) log.info('Environment = development');
if (isStaging) log.info('Environment = staging');
if (!isLocal && !isDevelopment && !isStaging) log.info('server.js - ' + 'Environment = staging or production');

/****************************************************************
 Setup basic auth for non-staging and non-production
 ****************************************************************/
if (isDevelopment || isStaging) {
  if (process.env.ELG_BASIC_AUTH_USER_NAME == null || process.env.ELG_BASIC_AUTH_USER_PWD == null) {
    log.error('Either the basic ELG username or password environmental variable is not set.');
  }

  let user_json = '{"' + process.env.ELG_BASIC_AUTH_USER_NAME + '" : "' + process.env.ELG_BASIC_AUTH_USER_PWD + '"}';
  const user_obj = JSON.parse(user_json);

  app.use(
    basicAuth({
      users: user_obj,
      challenge: true,
      unauthorizedResponse: getUnauthorizedResponse,
    })
  );
}

function getUnauthorizedResponse(req) {
  return req.auth ? 'Invalid credentials' : 'No credentials provided';
}

/******************************************************************************
 For Cloud.gov environments, get s3 endpoint location and get latest help file
 *****************************************************************************/
if (!isLocal) {
  (async () => {
    //get latest version of help pdf from s3
    const usersGuideFilename = 'ELG Database Users Guide.pdf';
    try {
      const usersGuide = await retrieveFileFromS3(usersGuideFilename);
      fs.writeFileSync(path.join(__dirname, './s3/' + usersGuideFilename), usersGuide);
    } catch (error) {
      log.error('Failed to download ' + usersGuideFilename + '; ' + error);
    }

    //get latest contact info from s3
    const contactFilename = 'contact.txt';
    try {
      const contact = await retrieveFileFromS3(contactFilename);
      fs.writeFileSync(path.join(__dirname, './s3/' + contactFilename), contact);
    } catch (error) {
      log.error('Failed to download ' + contactFilename + '; ' + error);
    }
  })();
}

/****************************************************************
 Is Glossary/Terminology Services authorization variable set?
 ****************************************************************/
if (process.env.ELG_GLOSSARY_AUTH) {
  log.info('ELG_GLOSSARY_AUTH environmental variable found, continuing.');

  let glossaryOptions = {
    host: 'etss.epa.gov',
    port: 443,
    path: '/synaptica_rest_services/api/vocabs/name/ELG%20Glossary/terms/full',
    headers: {
      authorization: 'basic ' + Buffer.from(process.env.ELG_GLOSSARY_AUTH).toString('base64'),
    },
  };

  const retrieveGlossary = async () => {
    //get glossary.json file from s3
    const glossaryFilename = 'glossary.json';
    try {
      const glossary = await retrieveFileFromS3(glossaryFilename);
      fs.writeFileSync(path.join(__dirname, './s3/' + glossaryFilename), glossary);
    } catch (error) {
      log.error('Failed to download ' + glossaryFilename + '; ' + error);
    }
  };

  https.get(glossaryOptions, (glossaryResponse) => {
    let response = '';
    const filename = 'glossary.json';

    glossaryResponse.on('data', (data) => {
      response += data;
    });

    glossaryResponse.on('end', () => {
      if (glossaryResponse.statusCode !== 200) {
        log.warn('Non-200 returned from glossary web service: ' + glossaryResponse.statusCode);

        if (!isLocal) {
          retrieveGlossary();
        }
      } else {
        log.info('Successful glossary request');

        fs.writeFileSync(path.join(__dirname, './s3/' + filename), response);

        if (!isLocal) {
          //upload glossary.json to s3 to use as a backup
          (async () => {
            try {
              await uploadFileToS3(filename, response, 'application/json');
              log.info('Successfully uploaded "' + filename + '"');
            } catch (error) {
              log.error('Failed to upload ' + filename + '; ' + error);
            }
          })();
        }
      }
    });

    glossaryResponse.on('error', (err) => {
      log.warn('Error returned from glossary web service: ' + err.message);

      if (!isLocal) {
        (async () => {
          //get glossary.json file from s3
          const glossaryFilename = 'glossary.json';
          try {
            const glossary = await retrieveFileFromS3(glossaryFilename);
            fs.writeFileSync(path.join(__dirname, './s3/' + glossaryFilename), glossary);
          } catch (error) {
            log.error('Failed to download ' + glossaryFilename + '; ' + error);
          }
        })();
      }
    });
  });
} else {
  log.error('Glossary/Terminology Services authorization variable NOT set!');
  if (!isLocal) process.exit();
}

//app.use(history());
require('./routes')(app, history());

app.listen(config.port);
log.info(`Server started on port ${config.port}`);
