const utilities = require('./utilities');

const ViewLimitation = require('../models').ViewLimitation;
const ViewLongTermAverage = require('../models').ViewLongTermAverage;
const TreatmentTechnologyCode = require('../models').TreatmentTechnologyCode;
const ViewWastestreamProcessTreatmentTechnology = require('../models').ViewWastestreamProcessTreatmentTechnology;
const ViewWastestreamProcessTreatmentTechnologyPollutant = require('../models').ViewWastestreamProcessTreatmentTechnologyPollutant;
const ViewWastestreamProcessTreatmentTechnologyPollutantLimitation = require('../models').ViewWastestreamProcessTreatmentTechnologyPollutantLimitation;

const PointSourceCategorySicCode = require('../models').PointSourceCategorySicCode;
const PointSourceCategoryNaicsCode = require('../models').PointSourceCategoryNaicsCode;
const Pollutant = require('../models').Pollutant;

const Op = require('sequelize').Op;
const Sequelize = require("sequelize");

const download = require('./download');

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

function wastestreamProcessLimitations(wastestreamProcessId) {
  return new Promise(function(resolve, reject) {
    ViewLimitation.findAll({
      attributes: attributes,
      where: {
        wastestreamProcessId: { [Op.eq]: wastestreamProcessId },
      },
      order: order
    })
      .then((limitations) => {
        let result = new Map();

        result.cfrSection = null;
        result.controlTechnologyCode = null;
        result.title = null;
        result.secondary = null;
        result.limitations = limitations;

        if (limitations.length > 0) {
          result.pointSourceCategoryCode = limitations[0].pointSourceCategoryCode;
          result.pointSourceCategoryName = limitations[0].pointSourceCategoryName;
          result.comboSubcategory = limitations[0].comboSubcategory;
          result.cfrSection = limitations[0].wastestreamProcessCfrSection;
          result.controlTechnologyCode = limitations[0].controlTechnologyCode;
          result.title = limitations[0].wastestreamProcessTitle;
          result.secondary = limitations[0].wastestreamProcessSecondary;
        }

        resolve(result);
      })
      .catch((error) => reject('Error retrieving limitations: ' + error));
  });
}

function pollutantLimitations(pollutantIds, pointSourceCategoryCodes) {
  return new Promise(function(resolve, reject) {
    ViewLimitation.findAll({
      attributes: attributes,
      where: {
        pollutantId: { [Op.in]: pollutantIds },
        pointSourceCategoryCode: { [Op.in]: pointSourceCategoryCodes }
      },
      order: order
    })
      .then((limitations) => {
        resolve(limitations);
      })
      .catch((error) => reject('Error retrieving limitations: ' + error));
  });
}

function technologyLimitations(id, treatmentIds, pointSourceCategoryCodes, pollutantIds) {
  return new Promise(function(resolve, reject) {
    //determine list of relevant treatment ids;
    // either specific treatment trains selected OR all treatment trains for the selected treatment technology code
    ViewWastestreamProcessTreatmentTechnology.findAll({
      attributes: ["treatmentId"],
      where: {
        [Op.and]: Sequelize.literal("lower('" + id + "') IN (SELECT codes FROM regexp_split_to_table(lower(treatment_codes), '; ') AS codes)"),
        [Op.or]: {
          treatmentId: {[Op.in]: treatmentIds},
          [Op.and]: Sequelize.literal(treatmentIds.length + ' = 0')
        }
      },
      group: ["treatmentId"]
    })
      .then(treatmentTechnologies => {
        treatmentIds = treatmentTechnologies.map(a => a.treatmentId)

        //determine list of wastestream processes that are relevant based on selected treatment trains and selected pollutants
        ViewWastestreamProcessTreatmentTechnologyPollutant.findAll({
          attributes: ['wastestreamProcessId'],
          where: {
            treatmentId: {[Op.in]: treatmentIds},
            [Op.or]: {
              elgPollutantDescription: {[Op.in]: pollutantIds},
              [Op.and]: Sequelize.literal(pollutantIds.length + ' = 0')
            }
          },
          group: ['wastestreamProcessId'],
        })
          .then(wastestreamProcesses => {
            if (wastestreamProcesses.length) {
              //determine list of limitations that are relevant based on selected PSCs, selected pollutants, and relevant wastestream processes
              ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAll({
                attributes: attributes.concat([
                  'treatmentCodes',
                  'treatmentNames',
                  [Sequelize.literal("replace(replace(wptt_tech_notes, '\\u00A7', U&'\\00A7'), '\\u00B5', U&'\\00B5')"), 'wastestreamProcessTreatmentTechnologyNotes'],
                  'wastestreamProcessTreatmentTechnologySourceTitle'
                ]),
                where: {
                  [Op.and]: [
                    Sequelize.literal("lower('" + id + "') IN (SELECT codes FROM regexp_split_to_table(lower(treatment_codes), '; ') AS codes)"),
                    {
                      [Op.or]: {
                        pointSourceCategoryCode: {[Op.in]: pointSourceCategoryCodes},
                        [Op.and]: Sequelize.literal(pointSourceCategoryCodes.length + ' = 0')
                      }
                    },
                    {
                      [Op.or]: {
                        elgPollutantDescription: {[Op.in]: pollutantIds},
                        [Op.and]: Sequelize.literal(pollutantIds.length + ' = 0')
                      }
                    },
                    {wastestreamProcessId: {[Op.in]: wastestreamProcesses.map(a => a.wastestreamProcessId)}}
                  ]
                },
                order: order
              })
                .then((limitations) => {
                  resolve(limitations);
                })
                .catch((error) => reject('Error retrieving limitations: ' + error));
            } else {
              //no possible wastestream process; return empty list of limitations
              resolve([]);
            }
          })
          .catch((error) => reject('Error retrieving wastestream processes for limitations: ' + error));
      })
      .catch((error) => reject('Error retrieving treatment trains for limitations: ' + error));
  });
}

function technologyCategoryLimitations(id, treatmentIds, pointSourceCategoryCodes, pollutantIds) {
  return new Promise(function(resolve, reject) {
    TreatmentTechnologyCode.findAll({
      where: {
        category: { [Op.iLike]: '%' + id + '%' }
      }
    })
      .then(treatmentTechnologyCodes => {
        let whereClauseOrList = [];
        treatmentTechnologyCodes.forEach(function(treatmentTechnologyCode) {
          whereClauseOrList.push({[Op.and]: Sequelize.literal("lower('" + treatmentTechnologyCode.id + "') IN (SELECT codes FROM regexp_split_to_table(lower(treatment_codes), '; ') AS codes)")});
        });

        //determine list of relevant treatment ids;
        // either specific treatment trains selected OR all treatment trains for the selected treatment technology code
        ViewWastestreamProcessTreatmentTechnology.findAll({
          attributes: ["treatmentId"],
          where: {
            [Op.and]: [
              {
                [Op.or]: whereClauseOrList
              },
              {
                [Op.or]: {
                  treatmentId: {[Op.in]: treatmentIds},
                  [Op.and]: Sequelize.literal(treatmentIds.length + ' = 0')
                }
              }
            ]
          },
          group: ["treatmentId"]
        })
          .then(treatmentTechnologies => {
            treatmentIds = treatmentTechnologies.map(a => a.treatmentId)

            //determine list of wastestream processes that are relevant based on selected treatment trains and selected pollutants
            ViewWastestreamProcessTreatmentTechnologyPollutant.findAll({
              attributes: ['wastestreamProcessId'],
              where: {
                treatmentId: {[Op.in]: treatmentIds},
                [Op.or]: {
                  elgPollutantDescription: {[Op.in]: pollutantIds},
                  [Op.and]: Sequelize.literal(pollutantIds.length + ' = 0')
                }
              },
              group: ['wastestreamProcessId'],
            })
              .then(wastestreamProcesses => {
                if (wastestreamProcesses.length) {
                  //determine list of limitations that are relevant based on selected PSCs, selected pollutants, and relevant wastestream processes
                  ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAll({
                    attributes: attributes.concat(['treatmentCodes', 'treatmentNames', 'wastestreamProcessTreatmentTechnologyNotes', 'wastestreamProcessTreatmentTechnologySourceTitle']),
                    where: {
                      [Op.and]: [
                        {
                          [Op.or]: whereClauseOrList
                        },
                        {
                          [Op.or]: {
                            pointSourceCategoryCode: {[Op.in]: pointSourceCategoryCodes},
                            [Op.and]: Sequelize.literal(pointSourceCategoryCodes.length + ' = 0')
                          }
                        },
                        {
                          [Op.or]: {
                            elgPollutantDescription: {[Op.in]: pollutantIds},
                            [Op.and]: Sequelize.literal(pollutantIds.length + ' = 0')
                          }
                        },
                        {wastestreamProcessId: {[Op.in]: wastestreamProcesses.map(a => a.wastestreamProcessId)}}
                      ]
                    },
                    order: order
                  })
                    .then((limitations) => {
                      resolve(limitations);
                    })
                    .catch((error) => reject('Error retrieving limitations: ' + error));
                } else {
                  //no possible wastestream process; return empty list of limitations
                  resolve([]);
                }
              })
              .catch((error) => reject('Error retrieving wastestream processes for limitations: ' + error));
          })
          .catch((error) => reject('Error retrieving treatment trains for limitations: ' + error));
      })
      .catch((error) => reject("Error! TreatmentTechnologyCode: " + error));
  });
}

function technologyBasisLimitations(treatmentId, pointSourceCategoryCode) {
  return new Promise(function(resolve, reject) {
    ViewWastestreamProcessTreatmentTechnology.findAll({
      attributes: ['wastestreamProcessId'],
      where: {
        treatmentId: {[Op.eq]: treatmentId},
        pointSourceCategoryCode: {[Op.eq]: pointSourceCategoryCode}
      }
    })
      .then(wastestreamProcessTreatmentTechnologies => {
        ViewLimitation.findAll({
          attributes: attributes,
          where: {
            wastestreamProcessId: { [Op.in]: wastestreamProcessTreatmentTechnologies.map(a => a.wastestreamProcessId) }
          },
          order: order
        })
          .then((limitations) => {
            resolve(limitations);
          })
          .catch((error) => reject('Error retrieving limitations: ' + error));
      })
      .catch((error) => reject('Error retrieving limitations: ' + error));
  });
}

function fillLongTermAverage(longTermAverage) {
  return new Promise(function(resolve, reject) {
    TreatmentTechnologyCode.findAll({
      where: {
        [Op.and]: Sequelize.literal("code IN (SELECT codes FROM regexp_split_to_table('" + longTermAverage.treatmentTechnologyCodes + "', '; ') AS codes)")
      }
    })
      .then(treatmentTechnologyCodes => {
        let names = longTermAverage.treatmentTechnologyCodes.split("; ").map(code => treatmentTechnologyCodes.filter(treatmentTechnologyCode => treatmentTechnologyCode.id === code)[0].name).join(" + ");

        resolve({
          treatmentTechnologyNames: names,
          pollutantDescription: longTermAverage.pollutantDescription,
          longTermAverageValue: longTermAverage.longTermAverageValue,
          longTermAverageUnitCode: longTermAverage.longTermAverageUnitCode,
          longTermAverageUnitDescription: longTermAverage.longTermAverageUnitDescription,
          longTermAverageUnitBasis: longTermAverage.longTermAverageUnitBasis,
          longTermAverageNotes: longTermAverage.longTermAverageNotes,
          longTermAverageSourceTitle: longTermAverage.longTermAverageSourceTitle,
          alternateLimitFlag: longTermAverage.alternateLimitFlag,
          limitationValue: longTermAverage.limitationValue,
          limitationUnitCode: longTermAverage.limitationUnitCode,
          limitationUnitDescription: longTermAverage.limitationUnitDescription,
          limitationUnitBasis: longTermAverage.limitationUnitBasis,
          wastestreamProcessTreatmentTechnologySourceTitle: longTermAverage.wastestreamProcessTreatmentTechnologySourceTitle,
          wastestreamProcessTreatmentTechnologyNotes: longTermAverage.wastestreamProcessTreatmentTechnologyNotes
        });
      })
      .catch(err => {
        console.error("Failed to retrieve treatment technology names: " + err);
        resolve({
          treatmentTechnologyNames: longTermAverage.treatmentTechnologyCodes,
          pollutantDescription: longTermAverage.pollutantDescription,
          longTermAverageValue: longTermAverage.longTermAverageValue,
          longTermAverageUnitCode: longTermAverage.longTermAverageUnitCode,
          longTermAverageUnitDescription: longTermAverage.longTermAverageUnitDescription,
          longTermAverageUnitBasis: longTermAverage.longTermAverageUnitBasis,
          longTermAverageNotes: longTermAverage.longTermAverageNotes,
          longTermAverageSourceTitle: longTermAverage.longTermAverageSourceTitle,
          alternateLimitFlag: longTermAverage.alternateLimitFlag,
          limitationValue: longTermAverage.limitationValue,
          limitationUnitCode: longTermAverage.limitationUnitCode,
          limitationUnitDescription: longTermAverage.limitationUnitDescription,
          limitationUnitBasis: longTermAverage.limitationUnitBasis,
          wastestreamProcessTreatmentTechnologySourceTitle: longTermAverage.wastestreamProcessTreatmentTechnologySourceTitle,
          wastestreamProcessTreatmentTechnologyNotes: longTermAverage.wastestreamProcessTreatmentTechnologyNotes
        });
      });
  });
}

function multiCriteriaSearchLimitations(pointSourceCategoryCodes,
                                        sicCodes,
                                        naicsCodes,
                                        pollutantIds,
                                        pollutantGroupIds,
                                        treatmentTechnologyCodes,
                                        treatmentTechnologyGroups,
                                        rangeLow,
                                        rangeHigh,
                                        rangeUnitCode) {
  return new Promise(function(resolve, reject) {
    if (pointSourceCategoryCodes.length === 0 &&
        sicCodes.length === 0 &&
        naicsCodes.length === 0 &&
        pollutantIds.length === 0 &&
        pollutantGroupIds.length === 0) //&&
        //treatmentTechnologyCodes.length === 0 &&
        //treatmentTechnologyGroups.length === 0)
    {
      //no criteria passed
      resolve([]);
    }
    else {
      let criteriaPromises = [];

      //get PSCs matching criteria
      let pscs = [];
      if (pointSourceCategoryCodes.length > 0) {
        pscs = pointSourceCategoryCodes;
      } else if (sicCodes.length > 0) {
        criteriaPromises.push(PointSourceCategorySicCode.findAll({
          attributes: ["generalPointSourceCategoryCode"],
          where: {
            sicCode: {[Op.in]: sicCodes}
          }
        })
          .then(pointSourceCategorySicCodes => {
            pscs = pointSourceCategorySicCodes.map(a => a.generalPointSourceCategoryCode);
          })
          .catch((error) => reject('Error retrieving limitations: ' + error)));
      } else if (naicsCodes.length > 0) {
        criteriaPromises.push(PointSourceCategoryNaicsCode.findAll({
          attributes: ["pointSourceCategoryCode"],
          where: {
            naicsCode: {[Op.in]: naicsCodes}
          }
        })
          .then(pointSourceCategorySicCodes => {
            pscs = pointSourceCategorySicCodes.map(a => a.pointSourceCategoryCode);
          })
          .catch((error) => reject('Error retrieving limitations: ' + error)));
      }

      //get pollutants matching criteria
      let pollutants = [];
      if (pollutantIds.length > 0) {
        pollutants = pollutantIds;
      } else if (pollutantGroupIds.length > 0) {
        let pollutantGroupWhereClause = {};
        pollutantGroupIds.forEach(groupId => {
          pollutantGroupWhereClause.push({[Op.and]: Sequelize.literal("lower('" + groupId + "') IN (SELECT groups FROM regexp_split_to_table(lower(pollutant_groups), ';') AS groups)")})
        });

        criteriaPromises.push(Pollutant.findAll({
          attributes: ["elgDescription"],
          where: {
            [Op.or]: {
              pollutantGroupWhereClause
            }
          }
        })
          .then(polls => {
            pollutants = polls.map(a => a.elgDescription);
          })
          .catch((error) => reject('Error retrieving limitations: ' + error)));
      }

      //get technology codes matching criteria
      let techCodes = [];
      if (treatmentTechnologyCodes.length > 0) {
        techCodes = treatmentTechnologyCodes;
      } else if (treatmentTechnologyGroups.length > 0) {
        let technologyGroupWhereClause = {};
        treatmentTechnologyGroups.forEach(group => {
          technologyGroupWhereClause.push({category: {[Op.iLike]: '%' + group + '%'}})
        });

        criteriaPromises.push(TreatmentTechnologyCode.findAll({
          attributes: ["id"],
          where: {
            [Op.or]: {
              technologyGroupWhereClause
            }
          }
        })
          .then(codes => {
            techCodes = codes.map(a => a.id);
          })
          .catch((error) => reject('Error retrieving limitations: ' + error)));
      }

      Promise.all(criteriaPromises)
        .then(ignore => {
          /*let rangeWhereClause = {};
          if (pollutants.length > 0 && rangeLow && rangeHigh && rangeUnitCode) {
            rangeWhereClause.push({limitationValue: { [Op.between]: [rangeLow, rangeHigh] }});
            rangeWhereClause.push({limitationUnitCode: { [Op.eq]: rangeUnitCode }});
          }
          else {
            rangeWhereClause.push({[Op.and]: Sequelize.literal("1 = 1")});
          }*/

          ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAll({
            attributes: attributes.concat(['treatmentId']),
            where: {
              [Op.and]: [
                /*Sequelize.literal("lower('" + id + "') IN (SELECT codes FROM regexp_split_to_table(lower(treatment_codes), '; ') AS codes)"),*/
                {
                  [Op.or]: {
                    pointSourceCategoryCode: {[Op.in]: pscs},
                    [Op.and]: Sequelize.literal((pointSourceCategoryCodes.length + sicCodes.length + naicsCodes.length) + ' = 0')
                  }
                },
                {
                  [Op.or]: {
                    elgPollutantDescription: {[Op.in]: pollutants},
                    [Op.and]: Sequelize.literal((pollutantIds.length + pollutantGroupIds.length) + ' = 0')
                  }
                },
                /*{
                  rangeWhereClause
                },*/
                /*{wastestreamProcessId: {[Op.in]: wastestreamProcesses.map(a => a.wastestreamProcessId)}}*/
              ]
            },
            order: order
          })
            .then(limitations => {
              resolve(limitations);
            })
            .catch((error) => reject('Error retrieving limitations: ' + error));
        })
        .catch((error) => reject('Error retrieving limitations: ' + error));
    }
  });
}

function keywordSearchLimitations(keywords, operator) {
  return new Promise(function(resolve, reject) {
    if (keywords.length === 1 && keywords[0] === '%%') {
      resolve([]);
    }
    else {
      if (operator === 'OR') {
        ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAll({
          attributes: attributes.concat(['treatmentId']),
          where: {
            [Op.or]: {
              //Point Source Category
              pointSourceCategoryName: {[Op.iLike]: {[Op.any]: keywords}},
              pointSourceSubcategoryTitle: {[Op.iLike]: {[Op.any]: keywords}},
              //TODO: GeneralProvision title and description

              //Process Operation/Wastestream
              wastestreamProcessTitle: {[Op.iLike]: {[Op.any]: keywords}},
              wastestreamProcessSecondary: {[Op.iLike]: {[Op.any]: keywords}},
              wastestreamProcessDescription: {[Op.iLike]: {[Op.any]: keywords}},
              wastestreamProcessLimitCalculationDescription: {[Op.iLike]: {[Op.any]: keywords}}, //also considered a Pollutant match
              wastestreamProcessNotes: {[Op.iLike]: {[Op.any]: keywords}},

              //Pollutant
              elgPollutantDescription: {[Op.iLike]: {[Op.any]: keywords}},
              limitRequirementDescription: {[Op.iLike]: {[Op.any]: keywords}},
              limitationPollutantNotes: {[Op.iLike]: {[Op.any]: keywords}},

              //Treatment Technology/Treatment Train
              treatmentNames: {[Op.iLike]: {[Op.any]: keywords}},
              //TODO: TreatmentTechnologyCode description
              wastestreamProcessTreatmentTechnologyNotes: {[Op.iLike]: {[Op.any]: keywords}},
              //TODO: LongTermAverage notes //also considered a Pollutant match
            }
          },
          order: order
        })
          .then(limitations => {
            resolve(limitations);
          })
          .catch((error) => reject('Error retrieving limitations: ' + error));
      } else {
        //AND search
        let andList = [];

        keywords.forEach(keyword => {
          andList.push({
            [Op.or]: {
              //Point Source Category
              pointSourceCategoryName: {[Op.iLike]: keyword},
              pointSourceSubcategoryTitle: {[Op.iLike]: keyword},
              //TODO: GeneralProvision title and description

              //Process Operation/Wastestream
              wastestreamProcessTitle: {[Op.iLike]: keyword},
              wastestreamProcessSecondary: {[Op.iLike]: keyword},
              wastestreamProcessDescription: {[Op.iLike]: keyword},
              wastestreamProcessLimitCalculationDescription: {[Op.iLike]: keyword}, //also considered a Pollutant match
              wastestreamProcessNotes: {[Op.iLike]: keyword},

              //Pollutant
              elgPollutantDescription: {[Op.iLike]: keyword},
              limitRequirementDescription: {[Op.iLike]: keyword},
              limitationPollutantNotes: {[Op.iLike]: keyword},

              //Treatment Technology/Treatment Train
              treatmentNames: {[Op.iLike]: keyword},
              //TODO: TreatmentTechnologyCode description
              wastestreamProcessTreatmentTechnologyNotes: {[Op.iLike]: keyword},
              //TODO: LongTermAverage notes //also considered a Pollutant match
            }
          });
        });

        ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAll({
          attributes: attributes.concat(['treatmentId']),
          where: {
            [Op.and]: andList
          },
          order: order
        })
          .then(limitations => {
            resolve(limitations);
          })
          .catch((error) => reject('Error retrieving limitations: ' + error));
      }
    }
  });
}

module.exports = {
  wastestreamProcessLimitations,
  pollutantLimitations,
  technologyLimitations,
  technologyCategoryLimitations,
  technologyBasisLimitations,
  multiCriteriaSearchLimitations,
  keywordSearchLimitations,
  /**
   * @param {
   *          {id:number},
   *          {download:string}
   * } req.query
   */
  read(req, res) {
    // check for required query attributes and replace with defaults if missing
    try {
      let id = utilities.parseIdAsInteger(req.query.id);

      if (id === null) {
        return res.status(400).send('Invalid value passed for id')
      }

      let downloadRequested = (req.query.download ? (req.query.download === 'true') : false);

      return ViewLimitation.findByPk(id, {
        attributes: [
          'elgPollutantDescription',
          'pointSourceCategoryCode',
          'pointSourceCategoryName',
          'comboSubcategory',
          'controlTechnologyCode',
          'controlTechnologyCfrSection',
          'wastestreamProcessTitle',
          'wastestreamProcessSecondary',
          'wastestreamProcessCfrSection',
        ]
      })
        .then((limitation) => {
          let result = new Map();
          result['pollutantDescription'] = limitation.elgPollutantDescription;
          result['pointSourceCategoryCode'] = limitation.pointSourceCategoryCode;
          result['pointSourceCategoryName'] = limitation.pointSourceCategoryName;
          result['comboSubcategory'] = limitation.comboSubcategory;
          result['controlTechnologyCode'] = limitation.controlTechnologyCode;
          result['controlTechnologyCfrSection'] = limitation.controlTechnologyCfrSection;
          result['wastestreamProcessTitle'] = limitation.wastestreamProcessTitle;
          result['wastestreamProcessSecondary'] = limitation.wastestreamProcessSecondary;
          result['wastestreamProcessCfrSection'] = limitation.wastestreamProcessCfrSection;
          result['longTermAverages'] = [];

          ViewLongTermAverage.findAll({
            attributes: [
              'treatmentTechnologyCodes',
              ['elg_pollutant_description', 'pollutantDescription'],
              'longTermAverageValue',
              'longTermAverageUnitCode',
              [Sequelize.literal("replace(lta_unit_desc, '\\u00A7', U&'\\00A7')"), 'longTermAverageUnitDescription'],
              'longTermAverageUnitBasis',
              'longTermAverageNotes',
              [Sequelize.literal("CASE WHEN lta_source_title IS NOT NULL THEN lta_source_title || CASE WHEN lta_notes IS NOT NULL THEN ': ' || lta_notes ELSE '' END ELSE '' END"), 'longTermAverageSourceTitle'],
              'alternateLimitFlag',
              'alternateLimitDescription',
              'limitationValue',
              'limitationUnitCode',
              [Sequelize.literal("replace(unit_desc, '\\u00A7', U&'\\00A7')"), 'limitationUnitDescription'],
              'limitationUnitBasis',
              'wastestreamProcessTreatmentTechnologySourceTitle',
              [Sequelize.literal("replace(replace(wptt_tech_notes, '\\u00A7', U&'\\00A7'), '\\u00B5', U&'\\00B5')"), 'wastestreamProcessTreatmentTechnologyNotes']
            ],
            where: {
              limitationId: { [Op.eq]: id }
            },
            order: ['treatmentTechnologyCodes', 'pollutantDescription']
          })
            .then((longTermAverages) => {
              let ltaPromises = [];

              longTermAverages.forEach(function(lta) {
                ltaPromises.push(fillLongTermAverage(lta));
              });

              Promise.all(ltaPromises)
                .then(ltas => {
                  result['longTermAverages'] = ltas.sort(function(a, b) {
                    if (a.treatmentTechnologyNames < b.treatmentTechnologyNames) {
                      return -1;
                    }
                    if (a.treatmentTechnologyNames > b.treatmentTechnologyNames) {
                      return 1;
                    }
                    return 0;
                  });

                  if (downloadRequested) {
                    download.createDownloadFile('longTermAverages',
                      'Long Term Averages',
                      [
                        { key: 'treatmentTechnologyNames', label: 'Treatment Train', width: 70 },
                        { key: 'wastestreamProcessTreatmentTechnologyNotes', label: 'Treatment Train Notes', width: 100, wrapText: true },
                        { key: 'pollutantDescription', label: 'Pollutant' },
                        { key: 'longTermAverageValue', label: 'LTA Value' },
                        { key: 'longTermAverageUnitCode', label: 'LTA Units', width: 90 },
                        { key: 'limitationValue', label: 'Limitation Value' },
                        { key: 'alternateLimitFlag', label: 'Limitation Flag' },
                        { key: 'limitationUnitCode', label: 'Limitation Units', width: 90 },
                        { key: 'limitationUnitBasis', label: 'Limitation Basis' },
                        { key: 'longTermAverageSourceTitle', label: 'LTA Reference', width: 150 }
                      ],
                      [
                        { label: 'Point Source Category ' + result['pointSourceCategoryCode'], value: result['pointSourceCategoryName'] },
                        { label: 'Subpart', value: result['comboSubcategory'] },
                        { label: 'Level of Control', value: result['controlTechnologyCode']},
                        { label: 'Process Operation/Wastestream', value: result['wastestreamProcessTitle'] },
                        { label: 'Other Process/Wastestream Details', value: result['wastestreamProcessSecondary'].replace(/<strong><u>and<\/u><\/strong>/ig, 'AND') },
                        { label: 'Pollutant', value: result['pollutantDescription'] }
                      ],
                      result['longTermAverages'],
                      res);
                  }
                  else {
                    res.status(200).send(result);
                  }
                });
            })
            .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
        })
        .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  },
};
