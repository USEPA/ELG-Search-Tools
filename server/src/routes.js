const path = require('path');
const express = require('express');

const controllers = require('./controllers/index.js');

module.exports = (app) => {
  app.get('/api', (req, res) =>
    res.status(200).send({
      message: 'Welcome to the API!',
    })
  );
  app.get('/api/pointSourceCategories', controllers.pointSourceCategory.list);
  app.get('/api/pointSourceCategory/:id', controllers.pointSourceCategory.read);

  app.get('/api/pointSourceSubcategory/:id', controllers.pointSourceSubcategory.read);

  app.get('/api/wastestreamProcess/:id', controllers.wastestreamProcess.read);

  // serve up built Vue files from express server
  app.use(express.static(path.resolve(__dirname, '../../client/dist/')));
};
