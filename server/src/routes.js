const path = require('path');
const express = require('express');

const controllers = require('./controllers/index.js');

const router = express.Router();
// Set /elg path for production environments (app is served from subpath)
const basePath = process.env.SUB_PATH ? process.env.SUB_PATH : '';

module.exports = (app, history) => {
  router.get('/', (req, res) => res.status(200).sendFile(path.resolve(__dirname, '../api-docs/elg_swagger2.json')));
  router.get('/pointSourceCategories', controllers.pointSourceCategory.list);
  router.get('/pointSourceCategory/:id', controllers.pointSourceCategory.read);
  router.get('/pointSourceCategoryCfr/:id', controllers.pointSourceCategory.cfr);
  router.get('/pointSourceCategoryDefinitions/:id', controllers.pointSourceCategory.definitions);
  router.get('/pointSourceCategoryCitationHistory/:id', controllers.pointSourceCategory.citationHistory);

  router.get('/pointSourceSubcategory/:id', controllers.pointSourceSubcategory.read);

  router.get('/wastestreamProcessLimitations', controllers.wastestreamProcess.limitations);

  router.get('/pollutants', controllers.pollutant.list);
  router.get('/pollutantCategories', controllers.pollutant.listCategories);
  router.get('/pollutant', controllers.pollutant.read);
  router.get('/pollutantCategory', controllers.pollutant.readCategory);
  router.get('/pollutantLimitations', controllers.pollutant.limitations);

  router.get('/limitation', controllers.limitation.read);

  router.get('/treatmentTechnologies', controllers.treatmentTechnology.list);
  router.get('/treatmentTechnologyCategories', controllers.treatmentTechnology.listCategories);
  router.get('/treatmentTechnology/:id', controllers.treatmentTechnology.read);
  router.get('/treatmentTechnologyCategory/:id', controllers.treatmentTechnology.readCategory);
  router.get('/treatmentTechnologyLimitations', controllers.treatmentTechnology.limitations);
  router.get('/treatmentTechnologyCategoryLimitations', controllers.treatmentTechnology.categoryLimitations);

  router.get('/multiCriteriaSearchCriteria', controllers.customSearch.multiCriteriaSearchCriteria);
  router.get('/multiCriteriaSearch', controllers.customSearch.multiCriteriaSearch);
  router.get('/keywordSearch', controllers.customSearch.keywordSearch);

  router.get('/glossary', controllers.glossary.list);

  router.get('/help', controllers.glossary.help);

  router.get('/contact', controllers.glossary.contact)

  app.use(`${basePath}/api`, router);

  // serve up built Vue files from express server (need to use regex to add trailing slash or else static serve won't work)
  const pathRegex = new RegExp(`^\\${basePath}$`);
  app.all(pathRegex, (req, res) => res.redirect(`${basePath}/`));
  app.use(`${basePath}/`, history);
  app.use(`${basePath}/`, express.static(path.resolve(__dirname, '../../client/dist/')));
};
