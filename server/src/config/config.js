module.exports = {
  port: process.env.PORT || 3001,
  db: {
    database: process.env.DB_NAME || 'elg_search',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    options: {
      dialect: process.env.DIALECT || 'postgres',
      host: process.env.HOST || 'localhost',
      port: process.env.PORT || '5432',
    },
  },
  authentication: {
    jwtSecret: process.env.JWT_SECRET || 'secret',
  },
  service: process.env.SERVICE_PROVIDER || 'Gmail',
  email: process.env.EMAIL || 'elg@gmail.com',
  emailPassword: process.env.EMAIL_PASSWORD || 'password',
  baseUrl: process.env.BASE_URL || 'http://localhost:8080',
};
