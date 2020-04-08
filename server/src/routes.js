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

  app.get('/api/limitation/:id', controllers.limitation.read);

  app.get('/api/treatmentTechnologies', controllers.treatmentTechnology.list);
  app.get('/api/treatmentTechnology/:id', controllers.treatmentTechnology.read);
  app.get('/api/treatmentTrain/:id', controllers.treatmentTechnology.treatmentTrain);
  app.get('/api/technologyBases', controllers.treatmentTechnology.technologyBases);
  app.get('/api/technologyBasisLimitations', controllers.treatmentTechnology.limitations);


  // serve up built Vue files from express server
  app.use(express.static(path.resolve(__dirname, '../../client/dist/')));
};
