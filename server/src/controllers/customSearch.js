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

const Op = require('sequelize').Op
const Sequelize = require("sequelize");

const download = require('./download');

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

function parsePollutantId(pollutantId) {
  let result = [];

  try {
    result = (pollutantId ? decodeURIComponent(pollutantId).split(';') : []);
  }
  catch (error) {
    console.log('pollutantId decodeURIComponent error: ' + error);
  }

  return result;
}

function parseMultiCriteriaSearchParams(query) {
  let pointSourceCategoryCodes = (query.pointSourceCategoryCode ? query.pointSourceCategoryCode.split(';') : []);
  let sicCodes = (query.sicCode ? query.sicCode.split(';') : []);
  let naicsCodes = (query.naicsCode ? query.naicsCode.split(';') : []);
  let pollutantIds = parsePollutantId(query.pollutantId);
  let pollutantGroupIds = (query.pollutantGroupId ? query.pollutantGroupId.split(';') : []);
  let treatmentTechnologyCodes = (query.treatmentTechnologyCode ? query.treatmentTechnologyCode.split(';') : []);
  let treatmentTechnologyGroups = (query.treatmentTechnologyGroup ? query.treatmentTechnologyGroup.split(';') : []);
  let rangeLow = query.rangeLow;
  let rangeHigh = query.rangeHigh;
  let rangeUnitCode = (query.rangeUnitCode ? query.rangeUnitCode : '');
  rangeUnitCode = (rangeUnitCode !== 'null' ? rangeUnitCode : '');

  let downloadRequested = utilities.parseDownload(query.download);

  let sortCol = query.sortCol;
  let sortDir = query.sortDir;

  let offset = (isNaN(query.offset)) ? 0 : Number(query.offset);
  let limit = (isNaN(query.limit)) ? 100 : Number(query.limit);

  let filterTreatmentIds = (query.filterTreatmentId ? query.filterTreatmentId.split(';') : []);
  let filterPointSourceCategoryCodes = (query.filterPointSourceCategoryCode ? query.filterPointSourceCategoryCode.split(';') : []);
  let filterPollutantIds = parsePollutantId(query.filterPollutantId);

  return {
    pointSourceCategoryCodes: pointSourceCategoryCodes,
    sicCodes: sicCodes,
    naicsCodes: naicsCodes,
    pollutantIds: pollutantIds,
    pollutantGroupIds: pollutantGroupIds,
    treatmentTechnologyCodes: treatmentTechnologyCodes,
    treatmentTechnologyGroups: treatmentTechnologyGroups,
    rangeLow: rangeLow,
    rangeHigh: rangeHigh,
    rangeUnitCode: rangeUnitCode,
    downloadRequested: downloadRequested,
    sortCol: sortCol,
    sortDir: sortDir,
    offset: offset,
    limit: limit,
    filterTreatmentIds: filterTreatmentIds,
    filterPointSourceCategoryCodes: filterPointSourceCategoryCodes,
    filterPollutantIds: filterPollutantIds
  }
}

function validateMultiCriteriaSearchParams(params) {
  return new Promise((resolve, reject) => {
    try {
      //validate that rangeUnitCode is a valid limitation unit code
      LimitationUnit.findOne({
        where: {
          code: {[Op.eq]: params.rangeUnitCode}
        }
      })
        .then(limitationUnit => {
          if (params.rangeUnitCode && limitationUnit === null) {
            reject("Invalid value passed for rangeUnitCode");
          }
          else {
            //validate that treatmentTechnologyGroup values are valid
            let treatmentTechnologyGroupsValid = true;
            params.treatmentTechnologyGroups.forEach(treatmentTechnologyGroup => {
              treatmentTechnologyGroupsValid = treatmentTechnologyGroupsValid && [
                "Physical, Not Elsewhere Classified",
                "Other",
                "Chemical",
                "Biological",
                "Thermal",
                "Filtration",
                "Sorption",
                "Membrane"
              ].includes(treatmentTechnologyGroup);
            });

            if (treatmentTechnologyGroupsValid) {
              PollutantGroup.findAll({
                where: {
                  id: { [Op.in]: params.pollutantGroupIds }
                }
              })
                .then(pollutantGroups => {
                  if (pollutantGroups.length !== params.pollutantGroupIds.length) {
                    reject("Invalid value passed for pollutantGroupId")
                  }
                  else {
                    resolve(params);
                  }
                })
                .catch((_ignore) => reject("Invalid value passed for pollutantGroupId"));
            }
            else {
              reject("Invalid value passed for treatmentTechnologyGroup");
            }
          }
        })
        .catch((_ignore) => reject("Invalid value passed for rangeUnitCode"));
    }
    catch (validationError) {
      reject(validationError);
    }
  });
}

function validateSortDir(sortDir) {
  return new Promise((resolve, reject) => {
    try {
      if (sortDir && !['ASC','DESC'].includes(sortDir.toUpperCase())) {
        reject('sortDir must be one of the following values: ASC, DESC');
      }
      else {
        resolve(true);
      }
    }
    catch (error) {
      reject(error);
    }
  });
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
          attributes: [ 'sicCode', [Sequelize.literal("lpad(sic_code::text, 4, '0')"), 'sicCodeDisplay'], 'sicDescription' ],
          where: {
            sicCodeAsNumber: { [Op.ne]: null },
            [Op.and]: Sequelize.literal("sic = sic_code::text"),
            [Op.and]: Sequelize.literal('sic_code in (select sic_code from elg_search."PointSourceCategorySicCode")')
          },
          order: [ 'sicCodeAsNumber', 'sicDescription' ],
        })
          .then(sicCodes => {
            NaicsCode.findAll({
              attributes: [ 'naicsCode', ['naics_code', 'naicsCodeDisplay'], 'naicsDescription' ],
              where: {
                naicsCodeAsNumber: { [Op.ne]: null },
                [Op.and]: Sequelize.literal("naics = naics_code::text"),
                [Op.and]: Sequelize.literal('naics_code in (select naics_code from elg_search."PointSourceCategoryNaicsCode")')
              },
              order: [ 'naicsCodeAsNumber', 'naicsDescription' ],
            })
              .then(naicsCodes => {
                Pollutant.findAll({
                  attributes: [
                    ['elg_pollutant_description', 'pollutantDescription'],
                    [Sequelize.literal("string_agg(distinct pollutant_desc, '|' order by pollutant_desc)"), 'pollutantId']
                  ],
                  where: {
                    [Op.and]: [Sequelize.literal('pollutant_code in (SELECT DISTINCT pollutant_code FROM elg_search."ViewLimitation")')]
                  },
                  group: ['elg_pollutant_description']
                })
                  .then(pollutants => {
                    PollutantGroup.findAll({
                      order: ['description']
                    })
                      .then(pollutantGroups => {
                        TreatmentTechnologyCode.findAll({
                          attributes: [
                            "id",
                            "name"
                          ],
                          where: {
                            [Op.and]: [Sequelize.literal('code in (select regexp_split_to_table(treatment_codes, \'; \') from elg_search."ViewWastestreamProcessTreatmentTechnology")')]
                          },
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
                                  where: {
                                    basis: { [Op.eq]: 'Concentration' }
                                  },
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
   *          {download:string},
   *          {offset:number},
   *          {limit:number},
   *          {sortCol:string},
   *          {sortDir:string}
   * } req.query
   */
  multiCriteriaSearch(req, res) {
    let params = parseMultiCriteriaSearchParams(req.query);

    validateMultiCriteriaSearchParams(params)
      .then(validParams => {
        let pointSourceCategoryCodes = validParams.pointSourceCategoryCodes;
        let sicCodes = validParams.sicCodes;
        let naicsCodes = validParams.naicsCodes;
        let pollutantIds = validParams.pollutantIds;
        let pollutantGroupIds = validParams.pollutantGroupIds;
        let treatmentTechnologyCodes = validParams.treatmentTechnologyCodes;
        let treatmentTechnologyGroups = validParams.treatmentTechnologyGroups;
        let rangeLow = validParams.rangeLow;
        let rangeHigh = validParams.rangeHigh;
        let rangeUnitCode = validParams.rangeUnitCode;

        let pointSourceCategoryDisplay = pointSourceCategoryCodes.join(', ');
        let sicCodeDisplay = sicCodes.join(', ');
        let naicsCodeDisplay = naicsCodes.join(', ');
        let pollutantDisplay = pollutantIds.join(', ');
        let pollutantGroupDisplay = pollutantGroupIds.join(', ');

        let low = (isNaN(rangeLow)) ? null : rangeLow;
        let high = (isNaN(rangeHigh)) ? null : rangeHigh;
        let limitationRangeDisplay = (low ? low + '-' + high + ' (' + rangeUnitCode + ')' : '');

        let treatmentTechnologyDisplay = treatmentTechnologyCodes.join(', ');
        let treatmentTechnologyGroupDisplay = treatmentTechnologyGroups.join(', ');

        let downloadRequested = utilities.parseDownload(req.query.download);

        let sortCol = validParams.sortCol;
        let sortDir = validParams.sortDir;

        let offset = validParams.offset;
        let limit = validParams.limit;

        //build criteria display values
        let criteriaDisplayPromises = [];

        criteriaDisplayPromises.push(PointSourceCategory.findAll({
          where: { pointSourceCategoryCode: { [Op.in]: pointSourceCategoryCodes } },
          order: [ 'pointSourceCategoryCode' ]
        })
          .then(codes => {
            pointSourceCategoryDisplay = codes.map(a =>
              a.pointSourceCategoryCode + ': ' + a.pointSourceCategoryName
            ).join(', ');
          }));

        criteriaDisplayPromises.push(SicCode.findAll({
          attributes: [ 'sicCodeAsNumber', 'sicDescription' ],
          where: {
            sicCodeAsNumber: { [Op.in]: sicCodes },
            [Op.and]: Sequelize.literal("sic = sic_code::text")
          },
          order: [ 'sicCodeAsNumber' ]
        })
          .then(codes => { sicCodeDisplay = codes.map(a => a.sicCodeAsNumber + ': ' + a.sicDescription).join(', '); }));

        criteriaDisplayPromises.push(NaicsCode.findAll({
          attributes: [ 'naicsCodeAsNumber', 'naicsDescription' ],
          where: {
            naicsCodeAsNumber: { [Op.in]: naicsCodes } ,
            [Op.and]: Sequelize.literal("naics = naics_code::text")
          },
          order: [ 'naicsCodeAsNumber' ]
        })
          .then(codes => { naicsCodeDisplay = codes.map(a => a.naicsCodeAsNumber + ': ' + a.naicsDescription).join(', '); }));

        criteriaDisplayPromises.push(Pollutant.findAll({
          attributes: [ 'elgDescription'],
          where: {
            description: { [Op.in]: pollutantIds.map(a => a.split("|")).reduce((acc, val) => acc.concat(val), []) }
          },
          group: [ 'elgDescription' ]
        })
          .then(codes => { pollutantDisplay = codes.map(a => a.elgDescription).join(', '); }));

        criteriaDisplayPromises.push(PollutantGroup.findAll({
          where: { id: { [Op.in]: pollutantGroupIds } },
          order: [ 'description' ]
        })
          .then(codes => { pollutantGroupDisplay = codes.map(a => a.description).join(', '); }));

        criteriaDisplayPromises.push(TreatmentTechnologyCode.findAll({
          where: { id: { [Op.in]: treatmentTechnologyCodes } },
          order: [ 'name' ]
        })
          .then(codes => { treatmentTechnologyDisplay = codes.map(a => a.name).join(', '); }));

        Promise.all(criteriaDisplayPromises)
          .then(_ignore => {
            if (downloadRequested) {
              limitation.multiCriteriaSearchLimitationsForDownload(
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
              )
                .then(dataStream => {
                  download.createDownloadFileFromStream('limitations',
                    'Limitations',
                    limitation.downloadDataColumns,
                    [
                      { label: 'Point Source Category', value: pointSourceCategoryDisplay },
                      { label: 'NAICS Code', value: sicCodeDisplay },
                      { label: 'SIC Code', value: naicsCodeDisplay },
                      { label: 'Pollutant', value: pollutantDisplay },
                      { label: 'Pollutant Category', value: pollutantGroupDisplay },
                      { label: 'Limitation Range', value: limitationRangeDisplay },
                      { label: 'Treatment Technology', value: treatmentTechnologyDisplay },
                      { label: 'Treatment Technology Category', value: treatmentTechnologyGroupDisplay }
                    ],
                    dataStream,
                    res);
                })
                .catch((error) => res.status(400).send('Error getting data for download: ' + utilities.sanitizeError(error)));
            }
            else {
              //first, get results without filter and row limit criteria to get all possible values for the filters
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
                rangeUnitCode,
                sortCol,
                sortDir,
                0,
                null,
                [],
                [],
                [],
                true
              )
                .then(allLimitations => {
                  PointSourceCategory.findAll({
                    attributes: ["pointSourceCategoryCode", "pointSourceCategoryName"],
                    where: {
                      pointSourceCategoryCode: {[Op.in]: [...new Set(allLimitations.rows.map(a => a.pointSourceCategoryCode))]}
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
                          elgDescription: {[Op.in]: [...new Set(allLimitations.rows.map(a => a.pollutantDescription))]}
                        },
                        group: ['elg_pollutant_description'],
                        order: ['elg_pollutant_description']
                      })
                        .then(polls => {
                          TreatmentTechnology.findAll({
                            attributes: ["id", "codes", "names"],
                            where: {
                              id: {[Op.in]: [...new Set(allLimitations.rows.map(a => a.treatmentId))]}
                            },
                            order: ["names"]
                          })
                            .then(treatmentTrains => {
                              //then, get the filtered results to be displayed
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
                                rangeUnitCode,
                                sortCol,
                                sortDir,
                                offset,
                                limit,
                                validParams.filterTreatmentIds,
                                validParams.filterPointSourceCategoryCodes,
                                validParams.filterPollutantIds
                              )
                                .then(filteredLimitations => {
                                  console.log('memory used: ' + Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100 / 100) +  'MB')
                                  res.status(200).send({
                                    pointSourceCategoryDisplay: pointSourceCategoryDisplay,
                                    sicCodeDisplay: sicCodeDisplay,
                                    naicsCodeDisplay: naicsCodeDisplay,
                                    pollutantDisplay: pollutantDisplay,
                                    pollutantGroupDisplay: pollutantGroupDisplay,
                                    limitationRangeDisplay: limitationRangeDisplay,
                                    treatmentTechnologyDisplay: treatmentTechnologyDisplay,
                                    treatmentTechnologyGroupDisplay: treatmentTechnologyGroupDisplay,
                                    limitations: filteredLimitations.rows,
                                    pointSourceCategories: pscs,
                                    pollutants: polls,
                                    treatmentTrains: treatmentTrains,
                                    count: filteredLimitations.count
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
            }
          })
          .catch((error) => {
            console.log('Error parsing criteria! ' + utilities.sanitizeError(error));
            res.status(400).send('Invalid criteria');
          });
      })
      .catch((error) => {
        console.log('Error parsing criteria! ' + utilities.sanitizeError(error));
        res.status(400).send('Invalid criteria');
      });
  },
  /**
   * @param {
   *          {keyword:string},
   *          {operator:string},
   *          {filterTreatmentId:string},
   *          {filterPointSourceCategoryCode:string},
   *          {filterPollutantId:string},
   *          {download:string},
   *          {offset:number},
   *          {limit:number},
   *          {sortCol:string},
   *          {sortDir:string}
   * } req.query
   */
  keywordSearch(req, res) {
    let keywords = parseKeyword(req.query.keyword);
    let operator = (req.query.operator ? req.query.operator : 'OR');

    let downloadRequested = utilities.parseDownload(req.query.download);

    let sortCol = req.query.sortCol;
    let sortDir = req.query.sortDir;

    validateSortDir(sortDir)
      .then(ignore => {
        if (downloadRequested) {
          limitation.keywordSearchLimitationsForDownload(keywords, operator, sortCol, sortDir)
            .then(dataStream => {
              download.createDownloadFileFromStream('limitations',
                'Limitations',
                limitation.downloadDataColumns,
                [
                  { label: 'Keyword(s)', value: keywords.map(a => a.replace(/\%/g, '')).join(" " + operator + " ")}
                ],
                dataStream,
                res);
            })
            .catch((error) => res.status(400).send('Error getting data for download: ' + utilities.sanitizeError(error)));
        }
        else {
          let offset = (isNaN(req.query.offset)) ? 0 : Number(req.query.offset);
          let limit = (isNaN(req.query.limit)) ? 100 : Number(req.query.limit);

          limitation.keywordSearchLimitations(keywords, operator, sortCol, sortDir, offset, limit)
            .then(result => {
              Pollutant.findAll({
                attributes: [
                  ['elg_pollutant_description', 'pollutantDescription'],
                  [Sequelize.literal("string_agg(distinct pollutant_desc, '|' order by pollutant_desc)"), 'pollutantId']
                ],
                where: { id: { [Op.in]: result.pollutants.map(poll => poll.id ) } },
                group: ['elg_pollutant_description'],
                order: ['elg_pollutant_description']
              })
                .then(polls => {
                  console.log('memory used: ' + Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100 / 100) +  'MB')
                  res.status(200).send({
                    pointSourceCategories: result.pointSourceCategoryCodes,
                    pollutants: polls,
                    wastestreamProcesses: result.wastestreamProcesses,
                    treatmentTrains: result.treatmentTrains,
                    limitations: result.limitations.rows,
                    count: result.limitations.count
                  });
                })
                .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
            })
            .catch((error) => res.status(400).send(utilities.sanitizeError(error)));
        }
      })
      .catch((sortDirValidationError) => {
        res.status(400).send(utilities.sanitizeError(sortDirValidationError));
      });
  }
};
