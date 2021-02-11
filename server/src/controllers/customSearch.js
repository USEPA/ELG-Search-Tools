const utilities = require('./utilities');
const limitation = require('./limitation');

const PointSourceCategory = require('../models').PointSourceCategory;
const SicCode = require('../models').SicCode;
const NaicsCode = require('../models').NaicsCode;
const Pollutant = require('../models').Pollutant;
const PollutantGroup = require('../models').PollutantGroup;
const TreatmentTechnologyCode = require('../models').TreatmentTechnologyCode;
const LimitationUnit = require('../models').LimitationUnit;
const TreatmentTechnology = require('../models').TreatmentTechnology;
const WastestreamProcess = require('../models').WastestreamProcess;
const Op = require('sequelize').Op
const Sequelize = require("sequelize");

function parseKeyword(keyword) {
  let result = [];

  if (keyword) {
    if (Array.isArray(keyword)) {
      result = keyword;
    } else {
      result = [keyword];
    }
  }

  if (result.length > 0) {
    result = [].concat(...result.map(a => a.split(';') ))

    for (let i = 0, len = result.length; i < len; i++) {
      result[i] = "%" + result[i] + "%";
    }
  } else {
    result = ["%%"];
  }

  return result;
}

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
  /**
   * @param {
   *          {pointSourceCategoryCode:string},
   *          {sicCode:string},
   *          {naicsCode:string},
   *          {pollutantId:string},
   *          {pollutantGroupId:string},
   *          {treatmentTechnologyCode:string},
   *          {treatmentTechnologyGroup:string},
   *          {rangeLow:number},
   *          {rangeHigh:number},
   *          {rangeUnitCode:string},
   *          {filterTreatmentId:string},
   *          {filterPointSourceCategoryCode:string},
   *          {filterPollutantId:string},
   *          {download:string}
   * } req.query
   */
  multiCriteriaSearch(req, res) {
    let pointSourceCategoryCodes = (req.query.pointSourceCategoryCode ? req.query.pointSourceCategoryCode.split(';') : []);
    let sicCodes = (req.query.sicCode ? req.query.sicCode.split(';') : []);
    let naicsCodes = (req.query.naicsCode ? req.query.naicsCode.split(';') : []);
    let pollutantIds = (req.query.pollutantId ? req.query.pollutantId.split(';') : []);
    let pollutantGroupIds = (req.query.pollutantGroupId ? req.query.pollutantGroupId.split(';') : []);
    let treatmentTechnologyCodes = (req.query.treatmentTechnologyCode ? req.query.treatmentTechnologyCode.split(';') : []);
    let treatmentTechnologyGroups = (req.query.treatmentTechnologyGroup ? req.query.treatmentTechnologyGroup.split(';') : []);
    let rangeLow = req.query.rangeLow;
    let rangeHigh = req.query.rangeHigh;
    let rangeUnitCode = req.query.rangeUnitCode;
    let downloadRequested = (req.query.download ? (req.query.download === 'true') : false);

    limitation.multiCriteriaSearchLimitations(
      pointSourceCategoryCodes,
      sicCodes,
      naicsCodes,
      pollutantIds,
      pollutantGroupIds,
      treatmentTechnologyCodes,
      treatmentTechnologyGroups,
      rangeLow,
      rangeHigh,
      rangeUnitCode
    )
      .then(limitations => {
        if (downloadRequested) {
          //TODO: implement download
        }
        else {
          PointSourceCategory.findAll({
            attributes: ["pointSourceCategoryCode", "pointSourceCategoryName"],
            where: {
              pointSourceCategoryCode: {[Op.in]: [...new Set(limitations.map(a => a.pointSourceCategoryCode))]}
            },
            order: ['pointSourceCategoryCode']
          })
            .then(pscs => {
              Pollutant.findAll({
                attributes: [
                  ['elg_pollutant_description', 'pollutantDescription'],
                  [Sequelize.literal("string_agg(distinct pollutant_desc, '|' order by pollutant_desc)"), 'pollutantId']
                ],
                where: {
                  elgDescription: {[Op.in]: [...new Set(limitations.map(a => a.pollutantDescription))]}
                },
                group: ['elg_pollutant_description'],
                order: ['elg_pollutant_description']
              })
                .then(polls => {
                  TreatmentTechnology.findAll({
                    attributes: ["id", "codes", "names"],
                    where: {
                      id: {[Op.in]: [...new Set(limitations.map(a => a.treatmentId))]}
                    },
                    order: ["names"]
                  })
                    .then(treatmentTrains => {
                      res.status(200).send({
                        pointSourceCategoryDisplay: pointSourceCategoryCodes.join(', '),
                        sicCodeDisplay: sicCodes.join(', '),
                        naicsCodeDisplay: naicsCodes.join(', '),
                        pollutantDisplay: pollutantIds.join(', '),
                        pollutantGroupDisplay: pollutantGroupIds.join(', '),
                        limitationRangeDisplay: (rangeLow ? rangeLow + '-' + rangeHigh + ' (' + rangeUnitCode + ')' : ''),
                        treatmentTechnologyDisplay: treatmentTechnologyCodes.join(', '),
                        treatmentTechnologyGroupDisplay: treatmentTechnologyGroups.join(', '),
                        limitations: limitations,
                        pointSourceCategories: pscs,
                        pollutants: polls,
                        treatmentTrains: treatmentTrains
                      });
                    })
                    .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
                })
                .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
            })
            .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
        }
      })
      .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
  },
  keywordSearch(req, res) {
    let keywords = parseKeyword(req.query.keyword);
    let operator = (req.query.operator ? req.query.operator : 'OR');
    let downloadRequested = (req.query.download ? (req.query.download === 'true') : false);

    limitation.keywordSearchLimitations(keywords, operator)
      .then(limitations => {
        if (downloadRequested) {
          //TODO: implement download
        }
        else {
          PointSourceCategory.findAll({
            attributes: ["pointSourceCategoryCode", "pointSourceCategoryName"],
            where: {
              pointSourceCategoryCode: {[Op.in]: [...new Set(limitations.map(a => a.pointSourceCategoryCode))]}
            },
            order: ['pointSourceCategoryCode']
          })
            .then(pscs => {
              Pollutant.findAll({
                attributes: [
                  ['elg_pollutant_description', 'pollutantDescription'],
                  [Sequelize.literal("string_agg(distinct pollutant_desc, '|' order by pollutant_desc)"), 'pollutantId']
                ],
                where: {
                  elgDescription: {[Op.in]: [...new Set(limitations.map(a => a.pollutantDescription))]}
                },
                group: ['elg_pollutant_description'],
                order: ['elg_pollutant_description']
              })
                .then(polls => {
                  WastestreamProcess.findAll({
                    attributes: ["id", "title"],
                    where: {
                      id: {[Op.in]: [...new Set(limitations.map(a => a.wastestreamProcessId))]}
                    },
                    order: ['title']
                  })
                    .then(wastestreamProcesses => {
                      TreatmentTechnology.findAll({
                        attributes: ["id", "codes", "names"],
                        where: {
                          id: {[Op.in]: [...new Set(limitations.map(a => a.treatmentId))]}
                        },
                        order: ["names"]
                      })
                        .then(treatmentTrains => {
                          res.status(200).send({
                            pointSourceCategories: pscs,
                            pollutants: polls,
                            wastestreamProcesses: wastestreamProcesses,
                            treatmentTrains: treatmentTrains,
                            limitations: limitations
                          });
                        })
                        .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
                    })
                    .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
                })
                .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
            })
            .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
        }
      })
      .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
  }
};
