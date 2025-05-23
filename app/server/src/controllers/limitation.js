const utilities = require('./utilities');

const ViewLimitation = require('../models').ViewLimitation;
const ViewLongTermAverage = require('../models').ViewLongTermAverage;
const TreatmentTechnologyCode = require('../models').TreatmentTechnologyCode;
const ViewWastestreamProcessTreatmentTechnology = require('../models').ViewWastestreamProcessTreatmentTechnology;
const ViewWastestreamProcessTreatmentTechnologyPollutantLimitation = require('../models')
  .ViewWastestreamProcessTreatmentTechnologyPollutantLimitation;

const PointSourceCategorySicCode = require('../models').PointSourceCategorySicCode;
const PointSourceCategoryNaicsCode = require('../models').PointSourceCategoryNaicsCode;
const Pollutant = require('../models').Pollutant;

const PointSourceCategory = require('../models').PointSourceCategory;
const WastestreamProcess = require('../models').WastestreamProcess;
const TreatmentTechnology = require('../models').TreatmentTechnology;

const LimitationKeywordSearch = require('../models').LimitationKeywordSearch;

const Op = require('sequelize').Op;
const Sequelize = require('sequelize');

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
  ['wp_lim_calc_desc', 'wastestreamProcessLimitCalculationDescription'],
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
  ['unit_desc', 'limitationUnitDescription'],
  'limitationUnitBasis',
  'alternateLimitFlag',
  'alternateLimitDescription',
  ['alt_lim', 'limitRequirement'],
  ['lim_lim_calc_desc', 'limitationLimitCalculationDescription'],
  ['lim_pollutant_notes', 'limitationPollutantNotes'],
  [Sequelize.literal("case when stat_base_type = 'Average' then lta_count else 0 end"), 'longTermAverageCount'],
  'pointSourceCategoryCode',
  'pointSourceCategoryName',
];

const downloadAttributes = [
  'controlTechnologyCode',
  'controlTechnologyCfrSection',
  'comboSubcategory',
  'wastestreamProcessTitle',
  ['elg_pollutant_description', 'pollutantDescription'],
  'limitationValue',
  'minimumValue',
  'maximumValue',
  'limitationDurationTypeDisplay',
  'limitationUnitCode',
  'alternateLimitFlag',
  'pointSourceCategoryName',
];

let order = [
  'pointSourceCategoryCode',
  'pointSourceCategoryName',
  'comboSubcategory',
  'controlTechnologyDisplayOrder',
  'wastestreamProcessDisplayOrder',
  'pollutantDescription',
  'limitationDurationDescription',
  'limitationDurationTypeDisplay',
];

function wastestreamProcessLimitations(wastestreamProcessId) {
  return new Promise(function(resolve, reject) {
    ViewLimitation.findAll({
      attributes: attributes,
      where: {
        wastestreamProcessId: { [Op.eq]: wastestreamProcessId },
      },
      order: order,
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
        pointSourceCategoryCode: { [Op.in]: pointSourceCategoryCodes },
      },
      order: order,
    })
      .then((limitations) => {
        resolve(limitations);
      })
      .catch((error) => reject('Error retrieving limitations: ' + error));
  });
}

function getPollutantOrClause(pollutantIds) {
  return [
    Sequelize.where(Sequelize.fn('regexp_replace', Sequelize.col('elg_pollutant_description'), '^\\s+', ''), {
      [Op.in]: pollutantIds.map((p) => p.trim()),
    }),
    Sequelize.literal(pollutantIds.length + ' = 0'),
  ];
}

function getTechnologyLimitationsWhereClause(
  id,
  treatmentIds,
  pointSourceCategoryCodes,
  pollutantIds,
  wastestreamProcesses
) {
  return {
    [Op.and]: [
      Sequelize.literal(
        "lower('" + id + "') IN (SELECT codes FROM regexp_split_to_table(lower(treatment_codes), '; ') AS codes)"
      ),
      {
        [Op.or]: {
          treatmentId: { [Op.in]: treatmentIds },
          [Op.and]: Sequelize.literal(treatmentIds.length + ' = 0'),
        },
      },
      {
        [Op.or]: {
          pointSourceCategoryCode: { [Op.in]: pointSourceCategoryCodes },
          [Op.and]: Sequelize.literal(pointSourceCategoryCodes.length + ' = 0'),
        },
      },
      {
        [Op.or]: getPollutantOrClause(pollutantIds),
      },
      { wastestreamProcessId: { [Op.in]: wastestreamProcesses.map((a) => a.wastestreamProcessId) } },
    ],
  };
}

function technologyLimitations(
  id,
  treatmentIds,
  pointSourceCategoryCodes,
  pollutantIds,
  sortCol,
  sortDir,
  treatmentNamesOnly = false
) {
  return new Promise(function(resolve, reject) {
    //determine list of relevant treatment ids;
    // either specific treatment trains selected OR all treatment trains for the selected treatment technology code
    ViewWastestreamProcessTreatmentTechnology.sequelize
      .query(
        'SELECT treatment_id as "treatmentId" ' +
          ' FROM elg_search."ViewWastestreamProcessTreatmentTechnology" ' +
          " WHERE lower(?) IN (SELECT codes FROM regexp_split_to_table(lower(treatment_codes), '; ') AS codes) " +
          '   AND (? = 0 OR treatment_id in (?)) ' +
          ' GROUP BY treatment_id',
        {
          replacements: [id, treatmentIds.length, treatmentIds.concat(null)],
          type: Sequelize.QueryTypes.SELECT,
        }
      )
      .then((treatmentTechnologies) => {
        treatmentIds = treatmentTechnologies.map((a) => a.treatmentId);

        //determine list of wastestream processes that are relevant based on selected treatment trains and selected pollutants
        ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAll({
          attributes: ['wastestreamProcessId'],
          where: {
            treatmentId: { [Op.in]: treatmentIds },
            [Op.or]: getPollutantOrClause(pollutantIds),
          },
          group: ['wastestreamProcessId'],
        })
          .then((wastestreamProcesses) => {
            if (wastestreamProcesses.length) {
              //determine list of limitations that are relevant based on selected PSCs, selected pollutants, and relevant wastestream processes
              let queryColumns = attributes.concat([
                'treatmentCodes',
                'treatmentNames',
                ['wptt_tech_notes', 'wastestreamProcessTreatmentTechnologyNotes'],
                'wastestreamProcessTreatmentTechnologySourceTitle',
              ]);

              if (treatmentNamesOnly) {
                queryColumns = ['treatmentNames'];
              }

              let whereClause = getTechnologyLimitationsWhereClause(
                id,
                treatmentIds,
                pointSourceCategoryCodes,
                pollutantIds,
                wastestreamProcesses
              );

              ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAll({
                attributes: queryColumns,
                where: whereClause,
                order: parseSort(sortCol, sortDir, queryColumns),
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

function technologyLimitationsForDownload(id, treatmentIds, pointSourceCategoryCodes, pollutantIds, sortCol, sortDir) {
  return new Promise(function(resolve, reject) {
    //determine list of relevant treatment ids;
    // either specific treatment trains selected OR all treatment trains for the selected treatment technology code
    ViewWastestreamProcessTreatmentTechnology.sequelize
      .query(
        'SELECT treatment_id as "treatmentId" ' +
          ' FROM elg_search."ViewWastestreamProcessTreatmentTechnology" ' +
          " WHERE lower(?) IN (SELECT codes FROM regexp_split_to_table(lower(treatment_codes), '; ') AS codes) " +
          '   AND (? = 0 OR treatment_id in (?)) ' +
          ' GROUP BY treatment_id',
        {
          replacements: [id, treatmentIds.length, treatmentIds.concat(null)],
          type: Sequelize.QueryTypes.SELECT,
        }
      )
      .then((treatmentTechnologies) => {
        treatmentIds = treatmentTechnologies.map((a) => a.treatmentId);

        //determine list of wastestream processes that are relevant based on selected treatment trains and selected pollutants
        ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAll({
          attributes: ['wastestreamProcessId'],
          where: {
            treatmentId: { [Op.in]: treatmentIds },
            [Op.or]: getPollutantOrClause(pollutantIds),
          },
          group: ['wastestreamProcessId'],
        })
          .then((wastestreamProcesses) => {
            if (wastestreamProcesses.length) {
              //determine list of limitations that are relevant based on selected PSCs, selected pollutants, and relevant wastestream processes
              let queryColumns = attributes.concat([
                'treatmentCodes',
                'treatmentNames',
                ['wptt_tech_notes', 'wastestreamProcessTreatmentTechnologyNotes'],
                'wastestreamProcessTreatmentTechnologySourceTitle',
              ]);

              let whereClause = getTechnologyLimitationsWhereClause(
                id,
                treatmentIds,
                pointSourceCategoryCodes,
                pollutantIds,
                wastestreamProcesses
              );

              const result = ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAllWithStream({
                batchSize: 5000,
                isObjectMode: true,
                attributes: queryColumns,
                where: whereClause,
                order: parseSort(sortCol, sortDir, queryColumns),
              });
              resolve(result);
            } else {
              //no possible wastestream process; return empty list of limitations
              resolve(null);
            }
          })
          .catch((error) => reject('Error retrieving wastestream processes for limitations: ' + error));
      })
      .catch((error) => reject('Error retrieving treatment trains for limitations: ' + error));
  });
}

function technologyCategoryLimitations(
  id,
  treatmentIds,
  pointSourceCategoryCodes,
  pollutantIds,
  sortCol,
  sortDir,
  offset,
  limit,
  treatmentNamesOnly = false
) {
  return new Promise(function(resolve, reject) {
    TreatmentTechnologyCode.findAll({
      where: {
        category: { [Op.iLike]: '%' + id + '%' },
      },
    })
      .then((treatmentTechnologyCodes) => {
        let whereClauseOrList = [];
        treatmentTechnologyCodes.forEach(function(treatmentTechnologyCode) {
          whereClauseOrList.push({
            [Op.and]: Sequelize.literal(
              "lower('" +
                treatmentTechnologyCode.id +
                "') IN (SELECT codes FROM regexp_split_to_table(lower(treatment_codes), '; ') AS codes)"
            ),
          });
        });

        //determine list of relevant treatment ids;
        // either specific treatment trains selected OR all treatment trains for the selected treatment technology code
        ViewWastestreamProcessTreatmentTechnology.findAll({
          attributes: ['treatmentId'],
          where: {
            [Op.and]: [
              {
                [Op.or]: whereClauseOrList,
              },
              {
                [Op.or]: {
                  treatmentId: { [Op.in]: treatmentIds },
                  [Op.and]: Sequelize.literal(treatmentIds.length + ' = 0'),
                },
              },
            ],
          },
          group: ['treatmentId'],
        })
          .then((treatmentTechnologies) => {
            treatmentIds = treatmentTechnologies.map((a) => a.treatmentId);

            //determine list of wastestream processes that are relevant based on selected treatment trains and selected pollutants
            ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAll({
              attributes: ['wastestreamProcessId'],
              where: {
                treatmentId: { [Op.in]: treatmentIds },
                [Op.or]: getPollutantOrClause(pollutantIds),
              },
              group: ['wastestreamProcessId'],
            })
              .then((wastestreamProcesses) => {
                if (wastestreamProcesses.length) {
                  //determine list of limitations that are relevant based on selected PSCs, selected pollutants, and relevant wastestream processes
                  let queryColumns = attributes.concat([
                    'treatmentCodes',
                    'treatmentNames',
                    ['wptt_tech_notes', 'wastestreamProcessTreatmentTechnologyNotes'],
                    'wastestreamProcessTreatmentTechnologySourceTitle',
                  ]);

                  if (treatmentNamesOnly) {
                    queryColumns = ['treatmentNames'];
                  }

                  let whereClause = getTechnologyCategoryLimitationsWhereClause(
                    whereClauseOrList,
                    treatmentIds,
                    pointSourceCategoryCodes,
                    pollutantIds,
                    wastestreamProcesses
                  );

                  ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAndCountAll({
                    attributes: queryColumns,
                    where: whereClause,
                    order: parseSort(sortCol, sortDir, queryColumns),
                    offset: offset,
                    limit: limit,
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
      .catch((error) => reject('Error! TreatmentTechnologyCode: ' + error));
  });
}

function getTechnologyCategoryLimitationsWhereClause(
  whereClauseOrList,
  treatmentIds,
  pointSourceCategoryCodes,
  pollutantIds,
  wastestreamProcesses
) {
  return {
    [Op.and]: [
      {
        [Op.or]: whereClauseOrList,
      },
      {
        [Op.or]: {
          treatmentId: { [Op.in]: treatmentIds },
          [Op.and]: Sequelize.literal(treatmentIds.length + ' = 0'),
        },
      },
      {
        [Op.or]: {
          pointSourceCategoryCode: { [Op.in]: pointSourceCategoryCodes },
          [Op.and]: Sequelize.literal(pointSourceCategoryCodes.length + ' = 0'),
        },
      },
      {
        [Op.or]: getPollutantOrClause(pollutantIds),
      },
      { wastestreamProcessId: { [Op.in]: wastestreamProcesses.map((a) => a.wastestreamProcessId) } },
    ],
  };
}

function technologyCategoryLimitationsForDownload(
  id,
  treatmentIds,
  pointSourceCategoryCodes,
  pollutantIds,
  sortCol,
  sortDir
) {
  return new Promise(function(resolve, reject) {
    TreatmentTechnologyCode.findAll({
      where: {
        category: { [Op.iLike]: '%' + id + '%' },
      },
    })
      .then((treatmentTechnologyCodes) => {
        let whereClauseOrList = [];
        treatmentTechnologyCodes.forEach(function(treatmentTechnologyCode) {
          whereClauseOrList.push({
            [Op.and]: Sequelize.literal(
              "lower('" +
                treatmentTechnologyCode.id +
                "') IN (SELECT codes FROM regexp_split_to_table(lower(treatment_codes), '; ') AS codes)"
            ),
          });
        });

        //determine list of relevant treatment ids;
        // either specific treatment trains selected OR all treatment trains for the selected treatment technology code
        ViewWastestreamProcessTreatmentTechnology.findAll({
          attributes: ['treatmentId'],
          where: {
            [Op.and]: [
              {
                [Op.or]: whereClauseOrList,
              },
              {
                [Op.or]: {
                  treatmentId: { [Op.in]: treatmentIds },
                  [Op.and]: Sequelize.literal(treatmentIds.length + ' = 0'),
                },
              },
            ],
          },
          group: ['treatmentId'],
        })
          .then((treatmentTechnologies) => {
            treatmentIds = treatmentTechnologies.map((a) => a.treatmentId);

            //determine list of wastestream processes that are relevant based on selected treatment trains and selected pollutants
            ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAll({
              attributes: ['wastestreamProcessId'],
              where: {
                treatmentId: { [Op.in]: treatmentIds },
                [Op.or]: getPollutantOrClause(pollutantIds),
              },
              group: ['wastestreamProcessId'],
            })
              .then((wastestreamProcesses) => {
                if (wastestreamProcesses.length) {
                  //determine list of limitations that are relevant based on selected PSCs, selected pollutants, and relevant wastestream processes
                  let queryColumns = attributes.concat([
                    'treatmentCodes',
                    'treatmentNames',
                    ['wptt_tech_notes', 'wastestreamProcessTreatmentTechnologyNotes'],
                    'wastestreamProcessTreatmentTechnologySourceTitle',
                  ]);

                  let whereClause = getTechnologyCategoryLimitationsWhereClause(
                    whereClauseOrList,
                    treatmentIds,
                    pointSourceCategoryCodes,
                    pollutantIds,
                    wastestreamProcesses
                  );

                  const result = ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAllWithStream({
                    batchSize: 5000,
                    isObjectMode: true,
                    attributes: queryColumns,
                    where: whereClause,
                    order: parseSort(sortCol, sortDir, queryColumns),
                  });
                  resolve(result);
                } else {
                  //no possible wastestream process; return empty list of limitations
                  resolve(null);
                }
              })
              .catch((error) => reject('Error retrieving wastestream processes for limitations: ' + error));
          })
          .catch((error) => reject('Error retrieving treatment trains for limitations: ' + error));
      })
      .catch((error) => reject('Error! TreatmentTechnologyCode: ' + error));
  });
}

function technologyBasisLimitations(treatmentId, pointSourceCategoryCode) {
  return new Promise(function(resolve, reject) {
    ViewWastestreamProcessTreatmentTechnology.findAll({
      attributes: ['wastestreamProcessId'],
      where: {
        treatmentId: { [Op.eq]: treatmentId },
        pointSourceCategoryCode: { [Op.eq]: pointSourceCategoryCode },
      },
    })
      .then((wastestreamProcessTreatmentTechnologies) => {
        ViewLimitation.findAll({
          attributes: attributes,
          where: {
            wastestreamProcessId: {
              [Op.in]: wastestreamProcessTreatmentTechnologies.map((a) => a.wastestreamProcessId),
            },
          },
          order: order,
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
  return new Promise(function(resolve) {
    TreatmentTechnologyCode.findAll({
      where: {
        [Op.and]: Sequelize.literal(
          "code IN (SELECT codes FROM regexp_split_to_table('" +
            longTermAverage.treatmentTechnologyCodes +
            "', '; ') AS codes)"
        ),
      },
    })
      .then((treatmentTechnologyCodes) => {
        let names = longTermAverage.treatmentTechnologyCodes
          .split('; ')
          .map(
            (code) =>
              treatmentTechnologyCodes.filter((treatmentTechnologyCode) => treatmentTechnologyCode.id === code)[0].name
          )
          .join(' + ');

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
          minimumValue: longTermAverage.minimumValue,
          maximumValue: longTermAverage.maximumValue,
          limitationUnitCode: longTermAverage.limitationUnitCode,
          limitationUnitDescription: longTermAverage.limitationUnitDescription,
          limitationUnitBasis: longTermAverage.limitationUnitBasis,
          wastestreamProcessTreatmentTechnologySourceTitle:
            longTermAverage.wastestreamProcessTreatmentTechnologySourceTitle,
          wastestreamProcessTreatmentTechnologyNotes: longTermAverage.wastestreamProcessTreatmentTechnologyNotes,
        });
      })
      .catch((err) => {
        console.error('Failed to retrieve treatment technology names: ' + err);
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
          minimumValue: longTermAverage.minimumValue,
          maximumValue: longTermAverage.maximumValue,
          limitationUnitCode: longTermAverage.limitationUnitCode,
          limitationUnitDescription: longTermAverage.limitationUnitDescription,
          limitationUnitBasis: longTermAverage.limitationUnitBasis,
          wastestreamProcessTreatmentTechnologySourceTitle:
            longTermAverage.wastestreamProcessTreatmentTechnologySourceTitle,
          wastestreamProcessTreatmentTechnologyNotes: longTermAverage.wastestreamProcessTreatmentTechnologyNotes,
        });
      });
  });
}

function parseSort(sortCol, sortDir, queryColumns) {
  let result = [];
  let columnMatch = false;

  if (sortCol) {
    columnMatch =
      queryColumns.filter((queryColumn) => {
        let columnName = Array.isArray(queryColumn) ? queryColumn[1] : queryColumn;
        return sortCol === columnName;
      }).length > 0;

    if (columnMatch) {
      if (!sortDir || !['ASC', 'DESC'].includes(sortDir.toUpperCase())) {
        result = [[sortCol, 'ASC']];
      } else {
        result = [[sortCol, sortDir]];
      }
    }
  }

  order.forEach((o) => {
    result.push([o, 'ASC']);
  });

  return result;
}

function getRangeWhereClause(pollutants, rangeLow, rangeHigh, rangeUnitCode) {
  let result = { [Op.and]: Sequelize.literal('1 = 1') };

  let low = isNaN(rangeLow) ? null : rangeLow;
  let high = isNaN(rangeHigh) ? null : rangeHigh;

  if (pollutants.length > 0 && low && high && rangeUnitCode) {
    result = {
      [Op.and]: {
        limitationValueAsNumber: { [Op.between]: [rangeLow, rangeHigh] },
        limitationUnitCode: { [Op.eq]: rangeUnitCode },
      },
    };
  }

  return result;
}

function getTechnologyCodeWhereClause(techCodes) {
  let result = { [Op.and]: Sequelize.literal('1 = 1') };
  if (techCodes.length > 0) {
    let technologyCodeOrList = [];
    techCodes.forEach((techCode) => {
      technologyCodeOrList.push(
        "lower('" +
          techCode +
          "') IN (SELECT codes FROM regexp_split_to_table(lower(trim(treatment_codes)), '; ') AS codes)"
      );
    });

    result = {
      [Op.and]: Sequelize.literal('(' + technologyCodeOrList.join(' OR ') + ')'),
    };
  }

  return result;
}

function getPscWhereClause(pscs, filterPointSourceCategoryCodes) {
  let result = { [Op.and]: Sequelize.literal('1 = 1') };
  if (pscs.length > 0 && filterPointSourceCategoryCodes.length > 0) {
    result = {
      pointSourceCategoryCode: {
        [Op.and]: [
          { [Op.in]: pscs },
          {
            [Op.in]: filterPointSourceCategoryCodes.filter((filterPsc) => {
              return !isNaN(filterPsc);
            }),
          },
        ],
      },
    };
  } else if (pscs.length > 0) {
    result = { pointSourceCategoryCode: { [Op.in]: pscs } };
  } else if (filterPointSourceCategoryCodes.length > 0) {
    result = {
      pointSourceCategoryCode: {
        [Op.in]: filterPointSourceCategoryCodes.filter((filterPsc) => {
          return !isNaN(filterPsc);
        }),
      },
    };
  }

  return result;
}

function getPollutantWhereClause(pollutants, filterPollutantIds) {
  let result = { [Op.and]: Sequelize.literal('1 = 1') };
  if (pollutants.length > 0 && filterPollutantIds.length > 0) {
    result = {
      pollutantDescription: {
        [Op.and]: [
          { [Op.in]: pollutants },
          { [Op.in]: filterPollutantIds.map((a) => a.split('|')).reduce((acc, val) => acc.concat(val), []) },
        ],
      },
    };
  } else if (pollutants.length > 0) {
    result = { pollutantDescription: { [Op.in]: pollutants } };
  } else if (filterPollutantIds.length > 0) {
    result = {
      pollutantDescription: {
        [Op.in]: filterPollutantIds.map((a) => a.split('|')).reduce((acc, val) => acc.concat(val), []),
      },
    };
  }

  return result;
}

function getMultiCriteriaSearchWhereClauses(
  pointSourceCategoryCodes,
  sicCodes,
  naicsCodes,
  pollutantIds,
  pollutantGroupIds,
  treatmentTechnologyCodes,
  treatmentTechnologyGroups,
  rangeLow,
  rangeHigh,
  rangeUnitCode,
  filterPointSourceCategoryCodes,
  filterPollutantIds
) {
  return new Promise((resolve, reject) => {
    let criteriaPromises = [];

    //get PSCs matching criteria
    let pscs = [];
    if (pointSourceCategoryCodes.length > 0) {
      pscs = pointSourceCategoryCodes;
    } else if (sicCodes.length > 0) {
      criteriaPromises.push(
        PointSourceCategorySicCode.findAll({
          attributes: ['generalPointSourceCategoryCode'],
          where: { sicCodeAsNumber: { [Op.in]: sicCodes } },
        })
          .then((pointSourceCategorySicCodes) => {
            pscs = pointSourceCategorySicCodes.map((a) => a.generalPointSourceCategoryCode);
          })
          .catch((error) => reject('Error retrieving limitations: ' + error))
      );
    } else if (naicsCodes.length > 0) {
      criteriaPromises.push(
        PointSourceCategoryNaicsCode.findAll({
          attributes: ['pointSourceCategoryCode'],
          where: { naicsCodeAsNumber: { [Op.in]: naicsCodes } },
        })
          .then((pointSourceCategoryNaicsCodes) => {
            pscs = pointSourceCategoryNaicsCodes.map((a) => a.pointSourceCategoryCode);
          })
          .catch((error) => reject('Error retrieving limitations: ' + error))
      );
    }

    //get pollutants matching criteria
    let pollutants = [];
    if (pollutantIds.length > 0) {
      pollutants = pollutantIds.map((a) => a.split('|')).reduce((acc, val) => acc.concat(val), []);
    } else if (pollutantGroupIds.length > 0) {
      let pollutantGroupWhereClause = [];

      pollutantGroupIds.forEach((groupId) => {
        pollutantGroupWhereClause.push({
          [Op.and]: Sequelize.literal(
            "lower('" +
              groupId +
              "') IN (SELECT groups FROM regexp_split_to_table(lower(pollutant_groups), ';') AS groups)"
          ),
        });
      });

      criteriaPromises.push(
        Pollutant.findAll({
          attributes: ['description'],
          where: { [Op.or]: [pollutantGroupWhereClause] },
        })
          .then((polls) => {
            pollutants = polls.map((a) => a.description);
          })
          .catch((error) => reject('Error retrieving limitations: ' + error))
      );
    }

    //get technology codes matching criteria
    let techCodes = [];
    if (treatmentTechnologyCodes.length > 0) {
      criteriaPromises.push(
        TreatmentTechnologyCode.findAll({
          attributes: ['id'],
          where: { id: { [Op.or]: treatmentTechnologyCodes } },
        })
          .then((codes) => {
            techCodes = codes.map((a) => a.id);
          })
          .catch((error) => reject('Error retrieving limitations: ' + error))
      );
    } else if (treatmentTechnologyGroups.length > 0) {
      let technologyGroupWhereClause = [];
      treatmentTechnologyGroups.forEach((group) => {
        technologyGroupWhereClause.push({ category: { [Op.iLike]: '%' + group + '%' } });
      });

      criteriaPromises.push(
        TreatmentTechnologyCode.findAll({
          attributes: ['id'],
          where: { [Op.or]: [technologyGroupWhereClause] },
        })
          .then((codes) => {
            techCodes = codes.map((a) => a.id);
          })
          .catch((error) => reject('Error retrieving limitations: ' + error))
      );
    }

    Promise.all(criteriaPromises)
      .then(() => {
        let rangeWhereClause = getRangeWhereClause(pollutants, rangeLow, rangeHigh, rangeUnitCode);
        let technologyCodeWhereClause = getTechnologyCodeWhereClause(techCodes);
        let pscWhereClause = getPscWhereClause(pscs, filterPointSourceCategoryCodes);
        let pollutantWhereClause = getPollutantWhereClause(pollutants, filterPollutantIds);

        resolve({
          rangeWhereClause: rangeWhereClause,
          technologyCodeWhereClause: technologyCodeWhereClause,
          pscWhereClause: pscWhereClause,
          pollutantWhereClause: pollutantWhereClause,
        });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function multiCriteriaSearchLimitationsForDownload(
  pointSourceCategoryCodes,
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
  sortDir
) {
  return new Promise(function(resolve, reject) {
    if (
      pointSourceCategoryCodes.length === 0 &&
      sicCodes.length === 0 &&
      naicsCodes.length === 0 &&
      pollutantIds.length === 0 &&
      pollutantGroupIds.length === 0 &&
      treatmentTechnologyCodes.length === 0 &&
      treatmentTechnologyGroups.length === 0
    ) {
      //no criteria passed
      resolve(null);
      return;
    }

    getMultiCriteriaSearchWhereClauses(
      pointSourceCategoryCodes,
      sicCodes,
      naicsCodes,
      pollutantIds,
      pollutantGroupIds,
      treatmentTechnologyCodes,
      treatmentTechnologyGroups,
      rangeLow,
      rangeHigh,
      rangeUnitCode,
      [],
      []
    )
      .then((whereClauses) => {
        //get the rows to be downloaded as a stream
        let queryColumns = downloadAttributes.concat([
          'treatmentNames',
          ['wptt_tech_notes', 'wastestreamProcessTreatmentTechnologyNotes'],
        ]);

        const result = ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAllWithStream({
          batchSize: 5000,
          isObjectMode: true,
          attributes: queryColumns,
          where: {
            [Op.and]: [
              whereClauses.technologyCodeWhereClause,
              whereClauses.pscWhereClause,
              whereClauses.pollutantWhereClause,
              whereClauses.rangeWhereClause,
            ],
          },
          order: parseSort(sortCol, sortDir, queryColumns),
        });
        resolve(result);
      })
      .catch((error) => {
        console.log('Error retrieving limitations: ' + error);
        reject('Error retrieving limitations: ' + error);
      });
  });
}

function multiCriteriaSearchLimitations(
  pointSourceCategoryCodes,
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
  sortDir,
  offset,
  limit,
  filterTreatmentIds = [],
  filterPointSourceCategoryCodes = [],
  filterPollutantIds = [],
  filterValuesOnly = false
) {
  return new Promise(function(resolve, reject) {
    if (
      pointSourceCategoryCodes.length === 0 &&
      sicCodes.length === 0 &&
      naicsCodes.length === 0 &&
      pollutantIds.length === 0 &&
      pollutantGroupIds.length === 0 &&
      treatmentTechnologyCodes.length === 0 &&
      treatmentTechnologyGroups.length === 0
    ) {
      //no criteria passed
      resolve({
        rows: [],
        count: 0,
      });
      return;
    }

    getMultiCriteriaSearchWhereClauses(
      pointSourceCategoryCodes,
      sicCodes,
      naicsCodes,
      pollutantIds,
      pollutantGroupIds,
      treatmentTechnologyCodes,
      treatmentTechnologyGroups,
      rangeLow,
      rangeHigh,
      rangeUnitCode,
      filterPointSourceCategoryCodes,
      filterPollutantIds
    )
      .then((whereClauses) => {
        let queryColumns = attributes.concat([
          'treatmentId',
          'treatmentCodes',
          'treatmentNames',
          ['wptt_tech_notes', 'wastestreamProcessTreatmentTechnologyNotes'],
          'wastestreamProcessTreatmentTechnologySourceTitle',
          ['pollutant_desc', 'pollutantId'],
        ]);

        if (filterValuesOnly) {
          //only need the data elements used to build the filter options
          queryColumns = [
            'pointSourceCategoryCode',
            ['elg_pollutant_description', 'pollutantDescription'],
            'treatmentId',
          ];
        }

        ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAndCountAll({
          attributes: queryColumns,
          where: {
            [Op.and]: [
              whereClauses.technologyCodeWhereClause,
              whereClauses.pscWhereClause,
              whereClauses.pollutantWhereClause,
              whereClauses.rangeWhereClause,
              {
                [Op.or]: [
                  {
                    treatmentId: {
                      [Op.in]: filterTreatmentIds.filter((filterTreatmentId) => {
                        return !isNaN(filterTreatmentId);
                      }),
                    },
                  },
                  Sequelize.literal(filterTreatmentIds.length + ' = 0'),
                ],
              },
            ],
          },
          order: parseSort(sortCol, sortDir, queryColumns),
          offset: offset,
          limit: limit,
        })
          .then((limitations) => {
            resolve(limitations);
          })
          .catch((error) => reject('Error retrieving limitations: ' + error));
      })
      .catch((error) => reject('Error retrieving limitations: ' + error));
  });
}

function getMatchingPointSourceCategories(keywords, limitationIds = []) {
  return new Promise(function(resolve, reject) {
    LimitationKeywordSearch.sequelize
      .query(
        'SELECT psc_code as "pointSourceCategoryCode" ' +
          ' FROM elg_search."LimitationKeywordSearch" ' +
          ' WHERE psc_vector @@ to_tsquery(?) AND (? = 0 OR lim_id in (?)) ' +
          ' GROUP BY psc_code',
        {
          replacements: [
            keywords.map((k) => k.replace(/\s/g, '<->')).join('|'),
            limitationIds.length,
            limitationIds.concat(null),
          ],
          type: Sequelize.QueryTypes.SELECT,
        }
      )
      .then((matches) => {
        PointSourceCategory.findAll({
          attributes: ['pointSourceCategoryCode', 'pointSourceCategoryName'],
          where: { pointSourceCategoryCode: { [Op.in]: matches.map((a) => a.pointSourceCategoryCode) } },
          order: ['pointSourceCategoryCode'],
        })
          .then((pscs) => {
            resolve(pscs);
          })
          .catch((error) => reject('Error retrieving limitations pscs: ' + error));
      })
      .catch((error) => reject('Error retrieving limitations pscs: ' + error));
  });
}

function getMatchingWastestreamProcesses(keywords, limitationIds = []) {
  return new Promise(function(resolve, reject) {
    LimitationKeywordSearch.sequelize
      .query(
        'SELECT processop_id as "wastestreamProcessId" ' +
          ' FROM elg_search."LimitationKeywordSearch" ' +
          ' WHERE wp_vector @@ to_tsquery(?) AND (? = 0 OR lim_id in (?)) ' +
          ' GROUP BY processop_id',
        {
          replacements: [
            keywords.map((k) => k.replace(/\s/g, '<->')).join('|'),
            limitationIds.length,
            limitationIds.concat(null),
          ],
          type: Sequelize.QueryTypes.SELECT,
        }
      )
      .then((matches) => {
        WastestreamProcess.findAll({
          attributes: [
            'id',
            [
              Sequelize.literal(
                "processop_title || CASE WHEN trim(secondary) <> '' THEN ' - ' || secondary ELSE '' END || ' (' || cfr_sect || ')'"
              ),
              'title',
            ],
          ],
          where: { id: { [Op.in]: matches.map((a) => a.wastestreamProcessId) } },
          order: [
            [
              Sequelize.literal(
                "processop_title || CASE WHEN trim(secondary) <> '' THEN ' - ' || secondary ELSE '' END || ' (' || cfr_sect || ')'"
              ),
            ],
          ],
        })
          .then((wps) => {
            resolve(wps);
          })
          .catch((error) => reject('Error retrieving limitations pscs: ' + error));
      })
      .catch((error) => reject('Error retrieving limitations pscs: ' + error));
  });
}

function getMatchingPollutants(keywords, limitationIds = []) {
  return new Promise(function(resolve, reject) {
    LimitationKeywordSearch.sequelize
      .query(
        'SELECT pollutant_code as "pollutantId" ' +
          ' FROM elg_search."LimitationKeywordSearch" ' +
          ' WHERE poll_vector @@ to_tsquery(?) AND (? = 0 OR lim_id in (?)) ' +
          ' GROUP BY pollutant_code',
        {
          replacements: [
            keywords.map((k) => k.replace(/\s/g, '<->')).join('|'),
            limitationIds.length,
            limitationIds.concat(null),
          ],
          type: Sequelize.QueryTypes.SELECT,
        }
      )
      .then((matches) => {
        Pollutant.findAll({
          attributes: ['id', 'description', 'elgDescription'],
          where: { id: { [Op.in]: matches.map((a) => a.pollutantId) } },
          order: ['elgDescription'],
        })
          .then((polls) => {
            resolve(polls);
          })
          .catch((error) => reject('Error retrieving polls: ' + error));
      })
      .catch((error) => reject('Error retrieving limitations pscs: ' + error));
  });
}

function getMatchingTreatmentTrains(keywords, limitationIds = []) {
  return new Promise(function(resolve, reject) {
    LimitationKeywordSearch.sequelize
      .query(
        'SELECT treatment_id as "treatmentId" ' +
          ' FROM elg_search."LimitationKeywordSearch" ' +
          ' WHERE tt_vector @@ to_tsquery(?) AND (? = 0 OR lim_id in (?)) ' +
          ' GROUP BY treatment_id',
        {
          replacements: [
            keywords.map((k) => k.replace(/\s/g, '<->')).join('|'),
            limitationIds.length,
            limitationIds.concat(null),
          ],
          type: Sequelize.QueryTypes.SELECT,
        }
      )
      .then((matches) => {
        TreatmentTechnology.findAll({
          attributes: ['id', 'codes', 'names'],
          where: { id: { [Op.in]: matches.map((a) => a.treatmentId) } },
          order: ['names'],
        })
          .then((tts) => {
            resolve(tts);
          })
          .catch((error) => reject('Error retrieving polls: ' + error));
      })
      .catch((error) => reject('Error retrieving limitations pscs: ' + error));
  });
}

function keywordSearchLimitations(keywords, operator, sortCol, sortDir, offset, limit) {
  return new Promise(function(resolve, reject) {
    let result = {
      limitations: [],
      pointSourceCategoryCodes: [],
      wastestreamProcesses: [],
      pollutants: [],
      treatmentTrains: [],
    };

    if (keywords.length === 1 && keywords[0] === '%%') {
      //no keywords passed
      resolve(result);
      return;
    }

    let tsqueryOperator = operator === 'AND' ? '&' : '|';

    //get limitationIds for limitations that match the keywords
    LimitationKeywordSearch.sequelize
      .query(
        'SELECT lim_id as "limitationId" ' +
          ' FROM elg_search."LimitationKeywordSearch" ' +
          ' WHERE all_vector @@ to_tsquery(?) ' +
          ' GROUP BY lim_id',
        {
          replacements: [keywords.map((k) => k.replace(/\s/g, '<->')).join(tsqueryOperator)],
          type: Sequelize.QueryTypes.SELECT,
        }
      )
      .then((matches) => {
        if (matches.length === 0) {
          resolve(result);
        } else {
          let limitationIds = matches.map((m) => m.limitationId);

          //get category matches for the keywords within this set of limitations
          let criteriaPromises = [];

          let pointSourceCategoryCodes = [];
          criteriaPromises.push(
            getMatchingPointSourceCategories(keywords, limitationIds).then((pscs) => {
              pointSourceCategoryCodes = pscs;
            })
          );

          let wastestreamProcesses = [];
          criteriaPromises.push(
            getMatchingWastestreamProcesses(keywords, limitationIds).then((wps) => {
              wastestreamProcesses = wps;
            })
          );

          let pollutants = [];
          criteriaPromises.push(
            getMatchingPollutants(keywords, limitationIds).then((polls) => {
              pollutants = polls;
            })
          );

          let treatmentTrains = [];
          criteriaPromises.push(
            getMatchingTreatmentTrains(keywords, limitationIds).then((tts) => {
              treatmentTrains = tts;
            })
          );

          Promise.all(criteriaPromises)
            .then(() => {
              result.pointSourceCategoryCodes = pointSourceCategoryCodes;
              result.wastestreamProcesses = wastestreamProcesses;
              result.pollutants = pollutants;
              result.treatmentTrains = treatmentTrains;

              //get the row-limited results to be displayed
              let queryColumns = attributes.concat([
                'treatmentId',
                'treatmentCodes',
                'treatmentNames',
                ['wptt_tech_notes', 'wastestreamProcessTreatmentTechnologyNotes'],
                'wastestreamProcessTreatmentTechnologySourceTitle',
                ['pollutant_desc', 'pollutantId'],
              ]);

              ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAndCountAll({
                attributes: queryColumns,
                where: {
                  limitationId: { [Op.in]: limitationIds },
                },
                order: parseSort(sortCol, sortDir, queryColumns),
                offset: offset,
                limit: limit,
              })
                .then((limitations) => {
                  result.limitations = limitations;
                  resolve(result);
                })
                .catch((error) => reject('Error retrieving limitations results: ' + error));
            })
            .catch((error) => reject('Error retrieving limitations criteria: ' + error));
        }
      })
      .catch(() => reject('Invalid value(s) passed for keyword.'));
  });
}

function keywordSearchLimitationsForDownload(keywords, operator, sortCol, sortDir) {
  return new Promise((resolve, reject) => {
    if (keywords.length === 1 && keywords[0] === '%%') {
      //no keywords passed
      resolve(null);
      return;
    }

    let tsqueryOperator = operator === 'AND' ? '&' : '|';

    //get limitationIds for limitations that match the keywords
    LimitationKeywordSearch.sequelize
      .query(
        'SELECT lim_id as "limitationId" ' +
          ' FROM elg_search."LimitationKeywordSearch" ' +
          ' WHERE all_vector @@ to_tsquery(?) ' +
          ' GROUP BY lim_id',
        {
          replacements: [keywords.map((k) => k.replace(/\s/g, '<->')).join(tsqueryOperator)],
          type: Sequelize.QueryTypes.SELECT,
        }
      )
      .then((matches) => {
        if (matches.length === 0) {
          resolve(null);
        } else {
          let limitationIds = matches.map((m) => m.limitationId);

          //get the rows to be downloaded as a stream
          let queryColumns = downloadAttributes.concat([
            'treatmentNames',
            ['wptt_tech_notes', 'wastestreamProcessTreatmentTechnologyNotes'],
          ]);

          const result = ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findAllWithStream({
            batchSize: 5000,
            isObjectMode: true,
            attributes: queryColumns,
            where: {
              limitationId: { [Op.in]: limitationIds },
            },
            order: parseSort(sortCol, sortDir, queryColumns),
          });
          resolve(result);
        }
      })
      .catch((error) => {
        reject('Error retrieving limitations ids for keyword search download: ' + error);
      });
  });
}

function sortLtas(ltas) {
  return new Promise((resolve, reject) => {
    try {
      let result = ltas.sort(function(a, b) {
        if (a.treatmentTechnologyNames < b.treatmentTechnologyNames) {
          return -1;
        }
        if (a.treatmentTechnologyNames > b.treatmentTechnologyNames) {
          return 1;
        }
        return 0;
      });

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  attributes,
  downloadAttributes,
  wastestreamProcessLimitations,
  pollutantLimitations,
  technologyLimitations,
  technologyLimitationsForDownload,
  technologyCategoryLimitations,
  technologyCategoryLimitationsForDownload,
  technologyBasisLimitations,
  multiCriteriaSearchLimitations,
  multiCriteriaSearchLimitationsForDownload,
  keywordSearchLimitations,
  keywordSearchLimitationsForDownload,
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
        return res.status(400).send('Invalid value passed for id');
      }

      let downloadRequested = utilities.parseDownload(req.query.download);

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
        ],
      })
        .then((limitation) => {
          let result = {
            pollutantDescription: null,
            pointSourceCategoryCode: null,
            pointSourceCategoryName: null,
            comboSubcategory: null,
            controlTechnologyCode: null,
            controlTechnologyCfrSection: null,
            wastestreamProcessTitle: null,
            wastestreamProcessSecondary: null,
            wastestreamProcessCfrSection: null,
            longTermAverages: [],
          };

          if (limitation !== null) {
            result['pollutantDescription'] = limitation.elgPollutantDescription;
            result['pointSourceCategoryCode'] = limitation.pointSourceCategoryCode;
            result['pointSourceCategoryName'] = limitation.pointSourceCategoryName;
            result['comboSubcategory'] = limitation.comboSubcategory;
            result['controlTechnologyCode'] = limitation.controlTechnologyCode;
            result['controlTechnologyCfrSection'] = limitation.controlTechnologyCfrSection;
            result['wastestreamProcessTitle'] = limitation.wastestreamProcessTitle;
            result['wastestreamProcessSecondary'] = limitation.wastestreamProcessSecondary;
            result['wastestreamProcessCfrSection'] = limitation.wastestreamProcessCfrSection;

            ViewLongTermAverage.findAll({
              attributes: [
                'treatmentTechnologyCodes',
                ['elg_pollutant_description', 'pollutantDescription'],
                'longTermAverageValue',
                'longTermAverageUnitCode',
                ['lta_unit_desc', 'longTermAverageUnitDescription'],
                'longTermAverageUnitBasis',
                'longTermAverageNotes',
                [
                  Sequelize.literal(
                    "CASE WHEN lta_source_title IS NOT NULL THEN lta_source_title || CASE WHEN lta_notes IS NOT NULL THEN ': ' || lta_notes ELSE '' END ELSE '' END"
                  ),
                  'longTermAverageSourceTitle',
                ],
                'alternateLimitFlag',
                'alternateLimitDescription',
                'limitationValue',
                'minimumValue',
                'maximumValue',
                'limitationUnitCode',
                ['unit_desc', 'limitationUnitDescription'],
                'limitationUnitBasis',
                'wastestreamProcessTreatmentTechnologySourceTitle',
                ['wptt_tech_notes', 'wastestreamProcessTreatmentTechnologyNotes'],
              ],
              where: {
                limitationId: { [Op.eq]: id },
              },
              order: ['treatmentTechnologyCodes', 'pollutantDescription'],
            })
              .then((longTermAverages) => {
                let ltaPromises = [];

                longTermAverages.forEach(function(lta) {
                  ltaPromises.push(fillLongTermAverage(lta));
                });

                Promise.all(ltaPromises).then((ltas) => {
                  sortLtas(ltas)
                    .then((sortedLtas) => {
                      result['longTermAverages'] = sortedLtas;

                      if (downloadRequested) {
                        download.createDownloadFile(
                          'longTermAverages',
                          'Long Term Averages',
                          [
                            { key: 'treatmentTechnologyNames', label: 'Treatment Train', width: 70 },
                            {
                              key: 'wastestreamProcessTreatmentTechnologyNotes',
                              label: 'Treatment Train Notes',
                              width: 100,
                              wrapText: true,
                            },
                            { key: 'pollutantDescription', label: 'Pollutant' },
                            { key: 'longTermAverageValue', label: 'LTA Value' },
                            { key: 'longTermAverageUnitCode', label: 'LTA Units', width: 90 },
                            {
                              key: 'limitationValue',
                              label: 'Limitation Value',
                              formatter: (row) =>
                                row.limitationValue ??
                                `${row.minimumValue}${row.maximumValue ? ' - ' + row.maximumValue : ''}`,
                            },
                            { key: 'alternateLimitFlag', label: 'Limitation Flag' },
                            { key: 'limitationUnitCode', label: 'Limitation Units', width: 90 },
                            { key: 'limitationUnitBasis', label: 'Limitation Basis' },
                            { key: 'longTermAverageSourceTitle', label: 'LTA Reference', width: 150 },
                          ],
                          [
                            {
                              label: 'Point Source Category ' + result['pointSourceCategoryCode'],
                              value: result['pointSourceCategoryName'],
                            },
                            { label: 'Subpart', value: result['comboSubcategory'] },
                            { label: 'Level of Control', value: result['controlTechnologyCode'] },
                            { label: 'Process Operation/Wastestream', value: result['wastestreamProcessTitle'] },
                            {
                              label: 'Other Process/Wastestream Details',
                              value: result['wastestreamProcessSecondary'].replace(
                                /<strong><u>and<\/u><\/strong>/gi,
                                'AND'
                              ),
                            },
                            { label: 'Pollutant', value: result['pollutantDescription'] },
                          ],
                          result['longTermAverages'],
                          res
                        );
                      } else {
                        res.status(200).send(result);
                      }
                    })
                    .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
                });
              })
              .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
          } else {
            res.status(200).send(result);
          }
        })
        .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  },
  downloadDataColumns: [
    { key: 'pointSourceCategoryName', label: 'Point Source Category', width: 60 },
    { key: 'controlTechnologyCfrSection', label: 'CFR Section' },
    { key: 'comboSubcategory', label: 'Subpart', width: 70 },
    { key: 'controlTechnologyCode', label: 'Level of Control' },
    { key: 'pollutantDescription', label: 'Pollutant', width: 40 },
    { key: 'wastestreamProcessTitle', label: 'Process', width: 60 },
    { key: 'treatmentNames', label: 'Treatment Train', width: 100 },
    { key: 'wastestreamProcessTreatmentTechnologyNotes', label: 'Treatment Train Notes', width: 100, wrapText: true },
    {
      key: 'limitationValue',
      label: 'Limitation Value',
      formatter: (row) =>
        row.limitationValue ?? `${row.minimumValue}${row.maximumValue ? ' - ' + row.maximumValue : ''}`,
    },
    { key: 'alternateLimitFlag', label: 'Limitation Flag' },
    { key: 'limitationUnitCode', label: 'Units', width: 90 },
    { key: 'limitationDurationTypeDisplay', label: 'Type of Limitation', width: 30 },
  ],
};
