const path = require('path');
const express = require('express');

module.exports = (app) => {
  // serve up built Vue files from express server
  app.use('/', express.static(path.resolve(__dirname, '../../client/dist')));
};
