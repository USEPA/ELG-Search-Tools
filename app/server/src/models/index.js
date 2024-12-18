const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelizeStream = require('node-sequelize-stream');
const basename = path.basename(__filename);
const config = require('../config/config');
const db = {};
const logger = require('../../utilities/logger.js');
const log = logger.logger;

const { database, user, password, host, port, options } = config.db;
const sequelize = new Sequelize(database, user, password, {
  host,
  port,
  dialect: options.dialect,
  dialectOptions: {
    client_encoding: options.encoding,
    ssl: options.ssl,
  },
  pool: {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000,
  },
  logging: log.debug.bind(log),
});

fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

sequelizeStream(sequelize, 100, false);

module.exports = db;
