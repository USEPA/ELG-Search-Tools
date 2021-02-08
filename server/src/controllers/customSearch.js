const utilities = require('./utilities');

const PointSourceCategory = require('../models').PointSourceCategory;
const SicCode = require('../models').SicCode;
const NaicsCode = require('../models').NaicsCode;
const Pollutant = require('../models').Pollutant;
const PollutantGroup = require('../models').PollutantGroup;
const ViewLimitation = require('../models').ViewLimitation;
const TreatmentTechnologyCode = require('../models').TreatmentTechnologyCode;
const LimitationUnit = require('../models').LimitationUnit;
const Op = require('sequelize').Op
const Sequelize = require("sequelize");

let attributes = [
  'limitationId',
  'controlTechnologyCode',
  'controlTechnologyCfrSection',
  'comboSubcategory',
  'wastestreamProcessId',
  'wastestreamProcessTitle',
  'wastestreamProcessSecondary',
  'wastestreamProcessCfrSection',
  [Sequelize.literal("split_part(wp_cfr_sect, '.', 1) || '_1' || split_part(wp_cfr_sect, '.', 2)"), 'cfrSectionAnchor'],
  'wastestreamProcessDescription',
  [Sequelize.literal("replace(wp_lim_calc_desc, '\\u00A7', U&'\\00A7')"), 'wastestreamProcessLimitCalculationDescription'],
  ['elg_pollutant_description', 'pollutantDescription'],
  'dischargeFrequency',
  'limitationValue',
  'minimumValue',
  'maximumValue',
  'zeroDischarge',
  'limitationDurationDescription',
  'limitationDurationBaseType',
  'limitationDurationTypeDisplay',
  'limitationUnitCode',
  [Sequelize.literal("replace(unit_desc, '\\u00A7', U&'\\00A7')"), 'limitationUnitDescription'],
  'limitationUnitBasis',
  'alternateLimitFlag',
  'alternateLimitDescription',
  [Sequelize.literal("replace(replace(alt_lim, '\\u00A7', U&'\\00A7'), '\\u00B0', U&'\\00B0')"), 'limitRequirementDescription'],
  [Sequelize.literal("replace(lim_lim_calc_desc, '\\u00A7', U&'\\00A7')"), 'limitationLimitCalculationDescription'],
  [Sequelize.literal("replace(replace(lim_pollutant_notes, '\\u00A7', U&'\\00A7'), '\\u00B5', U&'\\00B5')"), 'limitationPollutantNotes'],
  [Sequelize.literal("case when stat_base_type = 'Average' then lta_count else 0 end"), 'longTermAverageCount'],
  'pointSourceCategoryCode',
  'pointSourceCategoryName'
];

let order = [
  'pointSourceCategoryCode',
  'pointSourceCategoryName',
  'comboSubcategory',
  'controlTechnologyDisplayOrder',
  'wastestreamProcessDisplayOrder',
  'pollutantDescription',
  'limitationDurationDescription',
  'limitationDurationTypeDisplay'
];

module.exports = {
  multiCriteriaSearchCriteria(req, res) {
    return PointSourceCategory.findAll({
      attributes: ['pointSourceCategoryCode', 'pointSourceCategoryName'],
      where: {
        includeInSearchTool: { [Op.eq]: true },
      },
      order: ['pointSourceCategoryCode'],
    })
      .then((pointSourceCategories) => {
        SicCode.findAll({
          attributes: ['sicCode', 'sicDescription'],
          order: ['sicCode'],
        })
          .then(sicCodes => {
            NaicsCode.findAll({
              attributes: ['naicsCode', 'naicsDescription'],
              order: ['naicsCode'],
            })
              .then(naicsCodes => {
                Pollutant.findAll({
                  attributes: [
                    ['elg_pollutant_description', 'pollutantDescription'],
                    [Sequelize.literal("string_agg(distinct pollutant_desc, '|' order by pollutant_desc)"), 'pollutantId']
                  ],
                  /*where: {
                    id: { [Op.in]: pollutants.map(a => a.pollutantId) }
                  },*/
                  group: ['elg_pollutant_description']
                })
                  .then(pollutants => {
                    PollutantGroup.findAll({
                      /*where: {
                        id: { [Op.in]: polls.pollutantGroups.split(';') }
                      },*/
                      order: ['description']
                    })
                      .then(pollutantGroups => {
                        TreatmentTechnologyCode.findAll({
                          attributes: [
                            "id",
                            "name"
                          ],
                          /*where: {
                            id: { [Op.in]: wastestreamProcessTreatmentTechnologies.map(a => a.treatmentCodes).join('; ').split('; ') }
                          },*/
                          order: ["name"]
                        })
                          .then(treatmentTechnologyCodes => {
                            TreatmentTechnologyCode.findAll({
                              attributes: [ "category" ],
                              group: ['category'],
                              where: {
                                category: {
                                  [Op.and]: [
                                    { [Op.ne]: null },
                                    { [Op.ne]: 'Other' }
                                  ]
                                }
                              },
                              order: ["category"]
                            })
                              .then(treatmentTechnologyGroups => {
                                LimitationUnit.findAll({
                                  attributes: [ "code", "description" ],
                                  order: ["code"]
                                })
                                  .then(limitationUnits => {
                                    res.status(200).send({
                                      pointSourceCategories: pointSourceCategories,
                                      sicCodes: sicCodes,
                                      naicsCodes: naicsCodes,
                                      pollutants: pollutants,
                                      pollutantGroups: pollutantGroups,
                                      treatmentTechnologyCodes: treatmentTechnologyCodes,
                                      treatmentTechnologyGroups: treatmentTechnologyGroups,
                                      limitationUnits: limitationUnits
                                    });
                                  })
                                  .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
                              })
                              .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
                          })
                          .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
                      })
                      .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
                  })
                  .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
              })
              .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
          })
          .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
      })
      .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
  },
  multiCriteriaSearch(req, res) {
    let pointSourceCategories = req.query.pointSourceCategories;
    let sicCodes = req.query.sicCodes;
    let naicsCodes = req.query.naicsCodes;
    let pollutants = req.query.pollutants;
    let pollutantGroups = req.query.pollutantGroups;
    let treatmentTechnologies = req.query.treatmentTechnologies;
    let treatmentTechnologyGroups = req.query.treatmentTechnologyGroups;
    let rangeLow = req.query.rangeLow;
    let rangeHigh = req.query.rangeHigh;
    let rangeUnits = req.query.rangeUnits;

    return ViewLimitation.findAll({
      attributes: attributes,
      where: {
        pollutantDescription: {[Op.iLike]: '%Ammonia%'}
      },
      order: order
    })
      .then(limitations => {
        res.status(200).send({
          pointSourceCategoryDisplay: '[selected PSCs]',
          sicCodeDisplay:  '[selected SIC Codes]',
          naicsCodeDisplay: '[selected NAICS Codes]',
          pollutantDisplay: '[selected pollutants]',
          pollutantGroupDisplay: '[selected pollutant categories]',
          limitationRangeDisplay: '[selected limitation range]',
          treatmentTechnologyDisplay: '[selected treatment technologies]',
          treatmentTechnologyGroupDisplay: '[selected treatment technology groups]',
          limitations: limitations,
          pointSourceCategories: [{'pointSourceCategoryCode': 415, 'pointSourceCategoryName': 'Inorganic Chemicals Manufacturing'}],
          pollutants: [{'pollutantDescription': 'Ammonia', pollutantId: 'Ammonia|Ammonia & ammonium- total|Ammonia as N|Ammonia as NH3|Nitrogen, ammonia total (as NH4)'}],
          treatmentTrains: [{'id': '17', 'codes': 'ChemPre', 'names': 'Chemical Precipitation'}]
        });
      })
      .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)))
  },
  keywordSearch(req, res) {
    let keyword = '%Ammonia%';
    //let keyword = '%' + req.query.keyword + '%';

    return ViewLimitation.findAll({
      attributes: attributes,
      where: {
        pollutantDescription: {[Op.iLike]: keyword}
      },
      order: order
    })
      .then(limitations => {
        res.status(200).send({
          pointSourceCategories: [{'pointSourceCategoryCode': 415, 'pointSourceCategoryName': 'Inorganic Chemicals Manufacturing'}],
          pollutants: [{'pollutantDescription': 'Ammonia', pollutantId: 'Ammonia|Ammonia & ammonium- total|Ammonia as N|Ammonia as NH3|Nitrogen, ammonia total (as NH4)'}],
          wastestreamProcesses: [{id: 64092, title: 'Aluminum Chloride Production'}],
          treatmentTrains: [{'id': '17', 'codes': 'ChemPre', 'names': 'Chemical Precipitation'}],
          limitations: limitations
        });
      })
      .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)))
  }
};
