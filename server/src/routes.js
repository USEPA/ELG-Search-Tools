const path = require('path');
const express = require('express');
const authenticationController = require('./controllers/authenticationController');
const authenticationControllerPolicy = require('./middleware/authenticationControllerPolicy');
const refController = require('./controllers/refController');
const isAuthenticated = require('./middleware/isAuthenticated');

module.exports = (app) => {
  // serve up built Vue files from express server
  app.use('/', express.static(path.resolve(__dirname, '../../client/dist')));

  // auth routes
  app.post('/auth/register', authenticationControllerPolicy.register, authenticationController.register);
  app.post('/auth/login', authenticationController.login);
  app.get('/auth/user', isAuthenticated, authenticationController.user);
  app.post('/auth/user', isAuthenticated, authenticationController.user);
  app.post('/auth/logout', isAuthenticated, authenticationController.logout);
  app.post('/auth/forgotPassword', authenticationController.forgotPassword);
  app.get('/auth/resetPassword', authenticationController.renderResetPasswordTemplate);
  app.post('/auth/resetPassword', authenticationControllerPolicy.reset, authenticationController.resetPassword);
  app.post(
    '/auth/changePassword',
    isAuthenticated,
    authenticationControllerPolicy.changePassword,
    authenticationController.changePassword
  );

  // reference routes
  app.get('/api/roles', isAuthenticated, refController.roles);
};
