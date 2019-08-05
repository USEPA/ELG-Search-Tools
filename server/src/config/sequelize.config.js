const config = require('./config');

module.exports = {
  development: {
    username: config.db.user,
    password: config.db.password,
    database: config.db.database,
    host: config.db.options.host,
    port: config.db.options.port,
    dialect: config.db.options.dialect,
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
  },
};
