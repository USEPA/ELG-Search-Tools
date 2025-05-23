const logger = require('../../utilities/logger.js');
const log = logger.logger;

let isLocal = false;

let db = {
  database: process.env.DB_NAME ?? 'elg_search',
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASS ?? 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: process.env.DB_PORT ?? '5432',
  options: {
    dialect: 'postgres',
    encoding: 'UTF8',
  },
};

if (process.env.NODE_ENV) {
  isLocal = process.env.NODE_ENV.toLowerCase() === 'local';
}

if (isLocal) {
  log.info('Since local, using a localhost Postgres database.');
} else {
  if (process.env.VCAP_SERVICES) {
    log.info('Using VCAP_SERVICES Information to connect to Postgres.');
    const vcap_services = JSON.parse(process.env.VCAP_SERVICES);
    db = {
      database: 'postgres',
      user: vcap_services['aws-rds'][0].credentials.username,
      password: vcap_services['aws-rds'][0].credentials.password,
      host: vcap_services['aws-rds'][0].credentials.host,
      port: vcap_services['aws-rds'][0].credentials.port,
      options: {
        ...db.options,
        ssl: { rejectUnauthorized: false },
      },
    };
  } else {
    log.info('VCAP_SERVICES Information not found. Attempting connection to localhost...');
  }
}

module.exports = {
  port: process.env.PORT || 3001,
  db,
  authentication: {
    jwtSecret: process.env.JWT_SECRET || 'secret',
  },
  service: process.env.SERVICE_PROVIDER || 'Gmail',
  email: process.env.EMAIL || 'elg@gmail.com',
  emailPassword: process.env.EMAIL_PASSWORD || 'password',
  baseUrl: process.env.BASE_URL || 'http://localhost:8080',
};
