const config = require('./config');

module.exports = {
  local: {
    username: config.db.user,
    password: config.db.password,
    database: config.db.database,
    host: config.db.options.host,
    port: config.db.options.port,
    dialect: config.db.options.dialect,
    dialectOptions: {
      client_encoding: config.db.options.encoding,
    },
  },
  development: {
    username: config.db.user,
    password: config.db.password,
    database: config.db.database,
    host: config.db.options.host,
    port: config.db.options.port,
    dialect: config.db.options.dialect,
    dialectOptions: {
      client_encoding: config.db.options.encoding,
      ssl: config.db.options.ssl,
    },
  },
  staging: {
    username: config.db.user,
    password: config.db.password,
    database: config.db.database,
    host: config.db.options.host,
    port: config.db.options.port,
    dialect: config.db.options.dialect,
    dialectOptions: {
      client_encoding: config.db.options.encoding,
      ssl: config.db.options.ssl,
    },
  },
  production: {
    username: config.db.user,
    password: config.db.password,
    database: config.db.database,
    host: config.db.options.host,
    port: config.db.options.port,
    dialect: config.db.options.dialect,
    dialectOptions: {
      client_encoding: config.db.options.encoding,
      ssl: config.db.options.ssl,
    },
  },
};
