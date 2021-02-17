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

const PointSourceCategory = require('../models').PointSourceCategory;
const PointSourceSubcategory = require('../models').PointSourceSubcategory;
const GeneralProvision = require('../models').GeneralProvision;
const WastestreamProcess = require('../models').WastestreamProcess;
const Limitation = require('../models').Limitation;
const TreatmentTechnology = require('../models').TreatmentTechnology;
const WastestreamProcessTreatmentTechnology = require('../models').WastestreamProcessTreatmentTechnology;
const LongTermAverage = require('../models').LongTermAverage;

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
  'wastestreamProcessTypoFlagLimitCalculationDescription',
  ['elg_pollutant_description', 'pollutantDescription'],
  'dischargeFrequency',
  'limitationValue',
  'typoFlagLimitationValue',
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

function technologyLimitations(id, treatmentIds, pointSourceCategoryCodes, pollutantIds, sortCol, sortDir) {
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
        ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAll({
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
                order: parseSort(sortCol, sortDir)
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

function technologyCategoryLimitations(id, treatmentIds, pointSourceCategoryCodes, pollutantIds, sortCol, sortDir) {
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
            ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAll({
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
                    order: parseSort(sortCol, sortDir)
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
  return new Promise(function(resolve, ignore) {
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

function parseSort(sortCol, sortDir) {
  let result = [];

  if (sortCol) {
    if (!sortDir) {
      result = [[sortCol, "ASC"]];
    } else {
      result = [[sortCol, sortDir]];
    }
  }

  order.forEach(o => {
    result.push([o, "ASC"]);
    result.push([o, "ASC"]);
    result.push([o, "ASC"]);
  });

  return result;
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
                                        rangeUnitCode,
                                        sortCol,
                                        sortDir) {
  return new Promise(function(resolve, reject) {
    if (pointSourceCategoryCodes.length === 0 &&
        sicCodes.length === 0 &&
        naicsCodes.length === 0 &&
        pollutantIds.length === 0 &&
        pollutantGroupIds.length === 0 &&
        treatmentTechnologyCodes.length === 0 &&
        treatmentTechnologyGroups.length === 0)
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
        let pollutantGroupWhereClause = [];
        pollutantGroupIds.forEach(groupId => {
          pollutantGroupWhereClause.push({[Op.and]: Sequelize.literal("lower('" + groupId + "') IN (SELECT groups FROM regexp_split_to_table(lower(pollutant_groups), ';') AS groups)")})
        });

        criteriaPromises.push(Pollutant.findAll({
          attributes: ["elgDescription"],
          where: {
            [Op.or]: [
              pollutantGroupWhereClause
            ]
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
        let technologyGroupWhereClause = [];
        treatmentTechnologyGroups.forEach(group => {
          technologyGroupWhereClause.push({category: {[Op.iLike]: '%' + group + '%'}})
        });

        criteriaPromises.push(TreatmentTechnologyCode.findAll({
          attributes: ["id"],
          where: {
            [Op.or]: [
              technologyGroupWhereClause
            ]
          }
        })
          .then(codes => {
            techCodes = codes.map(a => a.id);
          })
          .catch((error) => reject('Error retrieving limitations: ' + error)));
      }

      Promise.all(criteriaPromises)
        .then(ignore => {
          let rangeWhereClause = {[Op.and]: Sequelize.literal("1 = 1")};
          if (pollutants.length > 0 && rangeLow && rangeHigh && rangeUnitCode) {
            rangeWhereClause = {
              [Op.and]: {
                limitationValue: { [Op.between]: [rangeLow, rangeHigh] },
                limitationUnitCode: { [Op.eq]: rangeUnitCode }
              }
            };
          }

          let technologyCodeWhereClause = {[Op.and]: Sequelize.literal("1 = 1")};
          if (techCodes.length > 0) {
            let technologyCodeOrList = [];
            techCodes.forEach(techCode => {
              technologyCodeOrList.push("lower('" + techCode + "') IN (SELECT codes FROM regexp_split_to_table(lower(treatment_codes), '; ') AS codes)");
            });

            technologyCodeWhereClause = {
              [Op.and]: Sequelize.literal("(" + technologyCodeOrList.join(" OR ") + ")")
            };
          }

          let pscWhereClause = {[Op.and]: Sequelize.literal("1 = 1")};
          if(pscs.length > 0) {
            pscWhereClause = {
              pointSourceCategoryCode: {[Op.in]: pscs}
            };
          }

          let pollutantWhereClause = {[Op.and]: Sequelize.literal("1 = 1")};
          if(pollutants.length > 0) {
            pollutantWhereClause = {
              elgPollutantDescription: {[Op.in]: pollutants}
            };
          }

          ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAll({
            attributes: attributes.concat(['treatmentId',
                                           'treatmentCodes',
                                           'treatmentNames',
                                           [Sequelize.literal("replace(replace(wptt_tech_notes, '\\u00A7', U&'\\00A7'), '\\u00B5', U&'\\00B5')"), 'wastestreamProcessTreatmentTechnologyNotes'],
                                           'wastestreamProcessTreatmentTechnologySourceTitle',
                                           ['pollutant_desc', 'pollutantId']]),
            where: {
              [Op.and]: [
                technologyCodeWhereClause,
                pscWhereClause,
                pollutantWhereClause,
                rangeWhereClause
              ]
            },
            order: parseSort(sortCol, sortDir)
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

function getMatchingPointSourceCategories(keywords) {
  return new Promise(function (resolve, reject) {
    let pscPromises = [];
    let pscs = [];

    //get psc codes from matching subcategories
    pscPromises.push(PointSourceSubcategory.findAll({
      attributes: [ 'pointSourceCategoryCode' ],
      where: { [Op.or]: { pointSourceSubcategoryTitle: {[Op.iLike]: {[Op.any]: keywords}} } }
    })
      .then(subs => { pscs.concat(subs.map(sub => sub.pointSourceCategoryCode)) })
      .catch((error) => reject('Error retrieving pscs subs: ' + error)));

    //get psc codes from matching provisions
    pscPromises.push(GeneralProvision.findAll({
      attributes: [ 'pointSourceCategoryCode' ],
      where: {
        [Op.or]: {
          title: { [Op.iLike]: { [Op.any]: keywords } },
          description: { [Op.iLike]: { [Op.any]: keywords } },
        }
      }
    })
      .then(gps => { pscs.concat(gps.map(gp => gp.pointSourceCategoryCode)) })
      .catch((error) => reject('Error retrieving pscs gps: ' + error)));

    //get matching pscs
    Promise.all(pscPromises)
      .then(ignore => {
        PointSourceCategory.findAll({
          attributes: [ 'pointSourceCategoryCode', 'pointSourceCategoryName' ],
          where: {
            [Op.or]: {
              pointSourceCategoryName: { [Op.iLike]: { [Op.any]: keywords } },
              pointSourceCategoryCode: { [Op.in]: pscs }
            }
          },
          order: [ 'pointSourceCategoryCode' ]
        })
          .then(matches => {
            resolve(matches);
          })
          .catch((error) => reject('Error retrieving limitations pscs: ' + error));
      })
      .catch(error => reject(error));
  });
}

function getMatchingWastestreamProcesses(keywords) {
  return new Promise(function (resolve, reject) {
    //get matching wps
    WastestreamProcess.findAll({
      attributes: [
        'id',
        [Sequelize.literal("processop_title || CASE WHEN trim(secondary) <> '' THEN ' - ' || secondary ELSE '' END || ' (' || cfr_sect || ')'"), 'title']
      ],
      where: {
        [Op.or]: {
          title: {[Op.iLike]: {[Op.any]: keywords}},
          secondary: {[Op.iLike]: {[Op.any]: keywords}},
          description: {[Op.iLike]: {[Op.any]: keywords}},
          limitCalculationDescription: {[Op.iLike]: {[Op.any]: keywords}},
          notes: {[Op.iLike]: {[Op.any]: keywords}}
        }
      },
      order: [ [Sequelize.literal("processop_title || CASE WHEN trim(secondary) <> '' THEN ' - ' || secondary ELSE '' END || ' (' || cfr_sect || ')'")] ]
    })
      .then(matches => {
        resolve(matches);
      })
      .catch((error) => reject('Error retrieving wps: ' + error))
  });
}

function getMatchingPollutants(keywords) {
  return new Promise(function (resolve, reject) {
    let pollPromises = [];
    let pollIds = [];

    //get limitation matches
    pollPromises.push(Limitation.findAll({
      attributes: [ 'pollutantId' ],
      where: {
        [Op.or]: {
          limitRequirementDescription: {[Op.iLike]: {[Op.any]: keywords}},
          pollutantNotes: {[Op.iLike]: {[Op.any]: keywords}}
        }
      }
    })
      .then(limits => {
        pollIds.concat(limits.map(limit => limit.pollutantId))
      })
      .catch((error) => reject('Error retrieving polls limits: ' + error)));

    //get wastestream matches
    pollPromises.push(WastestreamProcess.findAll({
      attributes: [ 'id' ],
      where: { [Op.or]: { limitCalculationDescription: {[Op.iLike]: {[Op.any]: keywords}} } }
    })
      .then(wps => {
        Limitation.findAll({
          attributes: [ 'pollutantId' ],
          where: { wastestreamProcessId: { [Op.in]: wps.map(wp => wp.id) } }
        })
          .then(limits => {
            pollIds.concat(limits.map(limit => limit.pollutantId))
          })
      })
      .catch((error) => reject('Error retrieving polls wps: ' + error)));

    //get lta matches
    pollPromises.push(LongTermAverage.findAll({
      attributes: [ 'limitationId' ],
      where: { notes: { [Op.iLike]: {[Op.any]: keywords } } }
    })
      .then(ltas => {
        ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAll({
          attributes: [ 'pollutantId' ],
          where: { limitationId: { [Op.in]: ltas.map(lta => lta.limitationId) } }
        })
          .then(limits => {
            pollIds.concat(limits.map(limit => limit.pollutantId))
          })
          .catch((error) => reject('Error retrieving polls ltas: ' + error))
      })
      .catch((error) => reject('Error retrieving polls ltas: ' + error)));

    //get matching polls
    Promise.all(pollPromises)
      .then(ignore => {
        Pollutant.findAll({
          attributes: [ 'id', 'description', 'elgDescription' ],
          where: {
            [Op.or]: {
              elgDescription: { [Op.iLike]: { [Op.any]: keywords } },
              id: { [Op.in]: pollIds }
            }
          },
          order: [ 'elgDescription' ]
        })
          .then(matches => {
            resolve(matches);
          })
          .catch((error) => reject('Error retrieving polls: ' + error));
      })
      .catch(error => reject(error));
  });
}

function getMatchingTreatmentTrains(keywords) {
  return new Promise(function (resolve, reject) {
    let ttPromises = [];
    let ttIds = [];

    //get tech code matches
    ttPromises.push(TreatmentTechnologyCode.findAll({
      attributes: [ 'id' ],
      where: { description: { [Op.iLike]: { [Op.any]: keywords} } }
    }).then(ttcs => {
      let ttWhereClause = {};
      let treatmentTechnologyCodeOrClause = ttcs.map(ttc => Sequelize.literal("lower('" + ttc.id + "') IN (SELECT codes FROM regexp_split_to_table(lower(treatment_codes), '; ') AS codes)"));

      TreatmentTechnology.findAll({
        attributes: [ 'id' ],
        where: {
          ...ttWhereClause,
          [Op.or]: treatmentTechnologyCodeOrClause,
        }
      })
        .then(tts => {
          ttIds.concat(tts.map(tt => tt.treatmentId));
        }).catch((error) => reject('Error retrieving limitations tts: ' + error));
    }).catch((error) => reject('Error retrieving limitations ttsByName: ' + error)));

    //get wastestream matches
    ttPromises.push(WastestreamProcessTreatmentTechnology.findAll({
      attributes: [ 'treatmentId' ],
      where: {
        [Op.or]: {
          notes: { [Op.iLike]: {[Op.any]: keywords } }
        }
      }
    })
      .then(wptts => {
        ttIds.concat(wptts.map(wptt => wptt.treatmentId))
      })
      .catch((error) => reject('Error retrieving tts wptts: ' + error)));

    //get lta matches
    ttPromises.push(LongTermAverage.findAll({
      attributes: [ 'limitationId' ],
      where: { notes: { [Op.iLike]: {[Op.any]: keywords } } }
    })
      .then(ltas => {
        ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAll({
          attributes: [ 'pollutantId' ],
          where: { limitationId: { [Op.in]: ltas.map(lta => lta.limitationId) } }
        })
          .then(limits => {
            ttIds.concat(limits.map(limit => limit.treatmentId))
          })
          .catch((error) => reject('Error retrieving tts ltas: ' + error))
      })
      .catch((error) => reject('Error retrieving tts ltas: ' + error)));

    //get matching tts
    Promise.all(ttPromises)
      .then(ignore => {
        TreatmentTechnology.findAll({
          attributes: [ 'id', 'codes', 'names' ],
          where: {
            [Op.or]: {
              names: { [Op.iLike]: { [Op.any]: keywords } },
              id: { [Op.in]: ttIds }
            }
          },
          order: [ 'names' ]
        })
          .then(matches => {
            resolve(matches);
          })
          .catch((error) => reject('Error retrieving polls: ' + error));
      })
      .catch(error => reject(error));
  });
}

function keywordSearchLimitations(keywords,
                                  operator,
                                  sortCol,
                                  sortDir) {
  return new Promise(function(resolve, reject) {
    if (keywords.length === 1 && keywords[0] === '%%') {
      resolve([]);
    }
    else {
      if (operator === 'OR' || keywords.length === 1) {
        let criteriaPromises = [];

        let pointSourceCategoryCodes = [];
        criteriaPromises.push(getMatchingPointSourceCategories(keywords).then(pscs => { pointSourceCategoryCodes = pscs }));

        let wastestreamProcesses = [];
        criteriaPromises.push(getMatchingWastestreamProcesses(keywords).then(wps => { wastestreamProcesses = wps }));

        let pollutants = [];
        criteriaPromises.push(getMatchingPollutants(keywords).then(polls => { pollutants = polls }));

        let treatmentTrains = [];
        criteriaPromises.push(getMatchingTreatmentTrains(keywords).then(tts => { treatmentTrains = tts }));

        Promise.all(criteriaPromises)
          .then(ignore => {
            ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAll({
              attributes: attributes.concat(['treatmentId',
                'treatmentCodes',
                'treatmentNames',
                [Sequelize.literal("replace(replace(wptt_tech_notes, '\\u00A7', U&'\\00A7'), '\\u00B5', U&'\\00B5')"), 'wastestreamProcessTreatmentTechnologyNotes'],
                'wastestreamProcessTreatmentTechnologySourceTitle',
                ['pollutant_desc', 'pollutantId']]),
              where: {
                [Op.or]: {
                  //Point Source Category
                  pointSourceCategoryCode: { [Op.in]: pointSourceCategoryCodes.map(psc => psc.pointSourceCategoryCode) },

                  //Process Operation/Wastestream
                  wastestreamProcessId: { [Op.in]: wastestreamProcesses.map(wp => wp.id) },

                  //Pollutant
                  pollutantId: { [Op.in]: pollutants.map(poll => poll.id) },

                  //Treatment Technology/Treatment Train
                  treatmentId: { [Op.in]: treatmentTrains.map(tt => tt.id) },
                }
              },
              order: parseSort(sortCol, sortDir)
            })
              .then(limitations => {
                resolve({
                  limitations: limitations,
                  pointSourceCategoryCodes: pointSourceCategoryCodes,
                  wastestreamProcesses: wastestreamProcesses,
                  pollutants: pollutants,
                  treatmentTrains: treatmentTrains
                });
              })
              .catch((error) => reject('Error retrieving limitations: ' + error));
          });

      } else {
        //AND search
        let andListPromises = [];
        let andList = [];

        let allPointSourceCategoryCodes = [];
        let allWastestreamProcesses = [];
        let allPollutants = [];
        let allTreatmentTrains = [];

        keywords.forEach(keyword => {
          andListPromises.push(new Promise(function(resolve, ignore) {
            let criteriaPromises = [];

            let pointSourceCategoryCodes = [];
            criteriaPromises.push(getMatchingPointSourceCategories([keyword]).then(pscs => { pointSourceCategoryCodes = pscs }));

            let wastestreamProcesses = [];
            criteriaPromises.push(getMatchingWastestreamProcesses([keyword]).then(wps => { wastestreamProcesses = wps }));

            let pollutants = [];
            criteriaPromises.push(getMatchingPollutants([keyword]).then(polls => { pollutants = polls }));

            let treatmentTrains = [];
            criteriaPromises.push(getMatchingTreatmentTrains([keyword]).then(tts => { treatmentTrains = tts }));

            Promise.all(criteriaPromises)
              .then(ignore => {
                function appendMatches(existingItems, newItems, idField) {
                  let existingIds = existingItems.map(a => a[idField]);
                  return existingItems.concat(newItems.filter(b => !existingIds.includes(b[idField])));
                }

                allPointSourceCategoryCodes = appendMatches(allPointSourceCategoryCodes, pointSourceCategoryCodes, 'pointSourceCategoryCode');
                allWastestreamProcesses = appendMatches(allWastestreamProcesses, wastestreamProcesses, 'id');
                allPollutants = appendMatches(allPollutants, pollutants, 'id');
                allTreatmentTrains = appendMatches(allTreatmentTrains, treatmentTrains, 'id');

                andList.push({
                  [Op.or]: {
                    //Point Source Category
                    pointSourceCategoryCode: { [Op.in]: pointSourceCategoryCodes.map(psc => psc.pointSourceCategoryCode) },

                    //Process Operation/Wastestream
                    wastestreamProcessId: { [Op.in]: wastestreamProcesses.map(wp => wp.id) },

                    //Pollutant
                    pollutantId: { [Op.in]: pollutants.map(poll => poll.id) },

                    //Treatment Technology/Treatment Train
                    treatmentId: { [Op.in]: treatmentTrains.map(tt => tt.id) },
                  }
                });

                resolve(andList);
              });
          }));
        });

        Promise.all(andListPromises)
          .then(ignore => {
            ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAll({
              attributes: attributes.concat(['treatmentId',
                'treatmentCodes',
                'treatmentNames',
                [Sequelize.literal("replace(replace(wptt_tech_notes, '\\u00A7', U&'\\00A7'), '\\u00B5', U&'\\00B5')"), 'wastestreamProcessTreatmentTechnologyNotes'],
                'wastestreamProcessTreatmentTechnologySourceTitle',
                ['pollutant_desc', 'pollutantId']]),
              where: {
                [Op.and]: andList
              },
              order: parseSort(sortCol, sortDir)
            })
              .then(limitations => {
                resolve({
                  limitations: limitations,
                  pointSourceCategoryCodes: allPointSourceCategoryCodes.sort((a, b) => {
                    if (a.pointSourceCategoryCode < b.pointSourceCategoryCode) { return -1 }
                    if (a.pointSourceCategoryCode > b.pointSourceCategoryCode) { return 1 }
                    return 0
                  }),
                  wastestreamProcesses: allWastestreamProcesses.sort((a, b) => {
                    if (a.title < b.title) { return -1 }
                    if (a.title > b.title) { return 1 }
                    return 0
                  }),
                  pollutants: allPollutants.sort((a, b) => {
                    if (a.elgDescription < b.elgDescription) { return -1 }
                    if (a.elgDescription > b.elgDescription) { return 1 }
                    return 0
                  }),
                  treatmentTrains: allTreatmentTrains.sort((a, b) => {
                    if (a.names < b.names) { return -1 }
                    if (a.names > b.names) { return 1 }
                    return 0
                  })
                });
              })
              .catch((error) => reject('Error retrieving limitations: ' + error));
          });
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
