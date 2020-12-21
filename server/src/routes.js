const path = require('path');
const express = require('express');

const controllers = require('./controllers/index.js');

module.exports = (app, history) => {
  app.get('/api', (req, res) =>
    res.status(200).sendFile(path.resolve(__dirname, '../api-docs/elg_swagger2.json'))
  );
  app.get('/api/pointSourceCategories', controllers.pointSourceCategory.list);
  app.get('/api/pointSourceCategory/:id', controllers.pointSourceCategory.read);
  app.get('/api/pointSourceCategoryCfr/:id', controllers.pointSourceCategory.cfr);
  app.get('/api/pointSourceCategoryDefinitions/:id', controllers.pointSourceCategory.definitions);
  app.get('/api/pointSourceCategoryCitationHistory/:id', controllers.pointSourceCategory.citationHistory);

  app.get('/api/pointSourceSubcategory/:id', controllers.pointSourceSubcategory.read);

  app.get('/api/wastestreamProcessLimitations', controllers.wastestreamProcess.limitations);

  app.get('/api/pollutants', controllers.pollutant.list);
  app.get('/api/pollutantCategories', controllers.pollutant.listCategories);
  app.get('/api/pollutant', controllers.pollutant.read);
  app.get('/api/pollutantCategory', controllers.pollutant.readCategory);
  app.get('/api/pollutantLimitations', controllers.pollutant.limitations);

  app.get('/api/limitation', controllers.limitation.read);

  app.get('/api/treatmentTechnologies', controllers.treatmentTechnology.list);
  app.get('/api/treatmentTechnologyCategories', controllers.treatmentTechnology.listCategories);
  app.get('/api/treatmentTechnology/:id', controllers.treatmentTechnology.read);
  app.get('/api/treatmentTechnologyCategory/:id', controllers.treatmentTechnology.readCategory);
  app.get('/api/treatmentTechnologyLimitations', controllers.treatmentTechnology.limitations);
  app.get('/api/treatmentTechnologyCategoryLimitations', controllers.treatmentTechnology.categoryLimitations);
  //app.get('/api/treatmentTrain/:id', controllers.treatmentTechnology.treatmentTrain);
  //app.get('/api/technologyBases', controllers.treatmentTechnology.technologyBases);
  //app.get('/api/technologyBasisLimitations', controllers.treatmentTechnology.technologyBasisLimitations);


  // serve up built Vue files from express server
  app.use(history);
  app.use(express.static(path.resolve(__dirname, '../../client/dist/')));
};
