const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const db = {};
const logger = require("../../utilities/logger.js");
const log = logger.logger;

let isLocal = false;
let isDevelopment = false;
let isStaging = false;

let database_host = "";
let database_user = "";
let database_pwd = "";
let database_port = "";
let database_name = "";

if (process.env.NODE_ENV) {
  isLocal = "local" === process.env.NODE_ENV.toLowerCase();
  isDevelopment = "development" === process.env.NODE_ENV.toLowerCase();
  isStaging = "staging" === process.env.NODE_ENV.toLowerCase();
}

if (isLocal) {
  log.info("Since local, using a localhost Postgres database.");
  database_host = "localhost";
  database_user = "postgres";
  database_pwd = "postgres";
  database_port = "5432";
  database_name = "elg_search"
} else {
  if (!process.env.VCAP_SERVICES) {
    log.error("Database information not set.");
    return;
  }

  let vcap_services = JSON.parse(process.env.VCAP_SERVICES);
  database_host = vcap_services["aws-rds"][0].credentials.host;
  database_user = vcap_services["aws-rds"][0].credentials.username;
  database_pwd = vcap_services["aws-rds"][0].credentials.password;
  database_port = vcap_services["aws-rds"][0].credentials.port;
  database_name = "postgres";
}
const sequelize = new Sequelize(
  database_name,
  database_user,
  database_pwd,
  {
    host: database_host,
    dialect: "postgres",
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    },
    logging: log.debug.bind(log)
  }
);

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
