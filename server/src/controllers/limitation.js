const utilities = require('./utilities');

const ViewLimitation = require('../models').ViewLimitation;
const ViewLongTermAverage = require('../models').ViewLongTermAverage;
const TreatmentTechnologyCode = require('../models').TreatmentTechnologyCode;
const ViewWastestreamProcessTreatmentTechnology = require('../models').ViewWastestreamProcessTreatmentTechnology;
const ViewWastestreamProcessTreatmentTechnologyPollutant = require('../models').ViewWastestreamProcessTreatmentTechnologyPollutant;
const ViewWastestreamProcessTreatmentTechnologyPollutantLimitation = require('../models').ViewWastestreamProcessTreatmentTechnologyPollutantLimitation;
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
  'wastestreamProcessLimitCalculationDescription',
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
  'limitRequirementDescription',
  [Sequelize.literal("replace(lim_lim_calc_desc, '\\u00A7', U&'\\00A7')"), 'limitationLimitCalculationDescription'],
  [Sequelize.literal("replace(lim_pollutant_notes, '\\u00A7', U&'\\00A7')"), 'limitationPollutantNotes'],
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
                attributes: attributes.concat(['treatmentCodes', 'treatmentNames', 'wastestreamProcessTreatmentTechnologyNotes', 'wastestreamProcessTreatmentTechnologySourceTitle']),
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

module.exports = {
  wastestreamProcessLimitations,
  pollutantLimitations,
  technologyLimitations,
  technologyCategoryLimitations,
  technologyBasisLimitations,
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
              'wastestreamProcessTreatmentTechnologyNotes'
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
                        { key: 'pollutantDescription', label: 'Pollutant' },
                        { key: 'longTermAverageValue', label: 'LTA Value' },
                        { key: 'alternateLimitFlag', label: 'Limitation Flag' },
                        { key: 'limitationValue', label: 'Limitation Value' },
                        { key: 'limitationUnitBasis', label: 'Limitation Basis' },
                        { key: 'longTermAverageSourceTitle', label: 'LTA Reference', width: 150 }
                      ],
                      [
                        { label: 'Point Source Category ' + result['pointSourceCategoryCode'], value: result['pointSourceCategoryName'] },
                        { label: 'Subpart', value: result['comboSubcategory'] },
                        { label: 'Level of Control', value: result['controlTechnologyCode']},
                        { label: 'Process Operation/Wastestream', value: result['wastestreamProcessTitle'] },
                        { label: 'Other Process/Wastestream Details', value: result['wastestreamProcessSecondary'].replace(/<strong><u>And<\/u><\/strong>/g, 'AND') },
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
