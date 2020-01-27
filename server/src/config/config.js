let isLocal = false;
let isDevelopment = false;
let isStaging = false;

let db = {
  database: "elg_search",
  user: "postgres",
  password: "postgres",
  options: {
    dialect: "postgres",
    host: "localhost",
    port: "5432"
  }
};

if (process.env.NODE_ENV) {
  isLocal = "local" === process.env.NODE_ENV.toLowerCase();
  isDevelopment = "development" === process.env.NODE_ENV.toLowerCase();
  isStaging = "staging" === process.env.NODE_ENV.toLowerCase();
}

if (isLocal) {
  console.log("Since local, using a localhost Postgres database.");
} else {
  if (process.env.VCAP_SERVICES) {
    console.log("Using VCAP_SERVICES Information to connect to Postgres.");
    vcap_services = JSON.parse(process.env.VCAP_SERVICES);
    db = {
      database: "elg_search",
      user: vcap_services["aws-rds"][0].credentials.username,
      password: vcap_services["aws-rds"][0].credentials.password,
      options: {
        dialect: "postgres",
        host: vcap_services["aws-rds"][0].credentials.host,
        port: vcap_services["aws-rds"][0].credentials.port
      }
    };
  } else {
    console.log(
      "VCAP_SERVICES Information not found. Attempting connection to localhost..."
    );
  }
}

module.exports = {
  port: process.env.PORT || 3001,
  db: db,
  authentication: {
    jwtSecret: process.env.JWT_SECRET || "secret"
  },
  service: process.env.SERVICE_PROVIDER || "Gmail",
  email: process.env.EMAIL || "elg@gmail.com",
  emailPassword: process.env.EMAIL_PASSWORD || "password",
  baseUrl: process.env.BASE_URL || "http://localhost:8080"
};
