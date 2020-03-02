const path = require('path');
const express = require('express');

const controllers = require('./controllers/index.js');

module.exports = (app) => {
  app.get('/api', (req, res) =>
    res.status(200).sendFile(path.resolve(__dirname, '../api-docs/elg_swagger2.json'))
  );
  app.get('/api/pointSourceCategories', controllers.pointSourceCategory.list);
  app.get('/api/pointSourceCategory/:id', controllers.pointSourceCategory.read);

  app.get('/api/pointSourceSubcategory/:id', controllers.pointSourceSubcategory.read);

  app.get('/api/wastestreamProcessLimitations/:id', controllers.wastestreamProcess.limitations);

  app.get('/api/pollutants', controllers.pollutant.list);
  app.get('/api/pollutant/:id', controllers.pollutant.read);
  app.get('/api/pollutantLimitations', controllers.pollutant.limitations);

  // serve up built Vue files from express server
  app.use(express.static(path.resolve(__dirname, '../../client/dist/')));
};
