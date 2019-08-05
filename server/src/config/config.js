module.exports = {
  port: process.env.PORT || 3000,
  db: {
    database: process.env.DB_NAME || 'elg',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'admin',
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
