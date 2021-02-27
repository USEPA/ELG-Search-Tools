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

const downloadDataColumns = [
  { key: 'pointSourceCategoryName', label: 'Point Source Category', width: 60 },
  { key: 'controlTechnologyCfrSection', label: 'CFR Section' },
  { key: 'comboSubcategory', label: 'Subpart', width: 70 },
  { key: 'controlTechnologyCode', label: 'Level of Control' },
  { key: 'pollutantDescription', label: 'Pollutant', width: 40 },
  { key: 'wastestreamProcessTitle', label: 'Process', width: 60 },
  { key: 'treatmentNames', label: 'Treatment Train', width: 100 },
  { key: 'wastestreamProcessTreatmentTechnologyNotes', label: 'Treatment Train Notes', width: 100, wrapText: true },
  { key: 'limitationValue', label: 'Limitation Value' },
  { key: 'alternateLimitFlag', label: 'Limitation Flag' },
  { key: 'limitationUnitCode', label: 'Units', width: 90 },
  { key: 'limitationDurationTypeDisplay', label: 'Type of Limitation', width: 30 }
];

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
          attributes: [
            'sicCode',
            [Sequelize.literal("regexp_replace(sic, '[^0-9]', '', 'g')"), 'sicCodeDisplay'],
            'sicDescription'
          ],
          where: {
            [Op.and]: Sequelize.literal("regexp_replace(sic, '[^0-9]', '', 'g') <> ''")
          },
          order: [
            [Sequelize.literal("regexp_replace(sic, '[^0-9]', '', 'g')")],
            'sicDescription'
          ],
        })
          .then(sicCodes => {
            NaicsCode.findAll({
              attributes: [
                'naicsCode',
                [Sequelize.literal("regexp_replace(naics, '[^0-9]', '', 'g')"), 'naicsCodeDisplay'],
                'naicsDescription'
              ],
              where: {
                [Op.and]: Sequelize.literal("regexp_replace(naics, '[^0-9]', '', 'g') <> ''")
              },
              order: [
                [Sequelize.literal("regexp_replace(naics, '[^0-9]', '', 'g')")],
                'naicsDescription'
              ],
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
    let pointSourceCategoryCodes = (req.query.pointSourceCategoryCode ? req.query.pointSourceCategoryCode.split(';') : []);
    let sicCodes = (req.query.sicCode ? req.query.sicCode.split(';') : []);
    let naicsCodes = (req.query.naicsCode ? req.query.naicsCode.split(';') : []);
    let pollutantIds = (req.query.pollutantId ? decodeURIComponent(req.query.pollutantId).split(';') : []);
    let pollutantGroupIds = (req.query.pollutantGroupId ? req.query.pollutantGroupId.split(';') : []);
    let treatmentTechnologyCodes = (req.query.treatmentTechnologyCode ? req.query.treatmentTechnologyCode.split(';') : []);
    let treatmentTechnologyGroups = (req.query.treatmentTechnologyGroup ? req.query.treatmentTechnologyGroup.split(';') : []);
    let rangeLow = req.query.rangeLow;
    let rangeHigh = req.query.rangeHigh;
    let rangeUnitCode = req.query.rangeUnitCode;

    let pointSourceCategoryDisplay = pointSourceCategoryCodes.join(', ');
    let sicCodeDisplay = sicCodes.join(', ');
    let naicsCodeDisplay = naicsCodes.join(', ');
    let pollutantDisplay = pollutantIds.join(', ');
    let pollutantGroupDisplay = pollutantGroupIds.join(', ');
    let limitationRangeDisplay = (rangeLow ? rangeLow + '-' + rangeHigh + ' (' + rangeUnitCode + ')' : '');
    let treatmentTechnologyDisplay = treatmentTechnologyCodes.join(', ');
    let treatmentTechnologyGroupDisplay = treatmentTechnologyGroups.join(', ');

    let downloadRequested = (req.query.download ? (req.query.download === 'true') : false);

    let sortCol = req.query.sortCol;
    let sortDir = req.query.sortDir;

    let offset = (isNaN(req.query.offset)) ? 0 : Number(req.query.offset);
    let limit = (isNaN(req.query.limit)) ? 100 : Number(req.query.limit);

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
      attributes: [
        [Sequelize.literal("regexp_replace(sic, '[^0-9]', '', 'g')"), 'sicCode'],
        'sicDescription'
      ],
      where: {
        [Op.and]: Sequelize.literal("regexp_replace(sic, '[^0-9]', '', 'g') IN (" + sicCodes.map(a => "'" + a + "'").concat('NULL') + ")") //TODO: use replacements
      },
      order: [ 'sicCode' ]
    })
      .then(codes => { sicCodeDisplay = codes.map(a => a.sicCode + ': ' + a.sicDescription).join(', '); }));

    criteriaDisplayPromises.push(NaicsCode.findAll({
      attributes: [
        [Sequelize.literal("regexp_replace(naics, '[^0-9]', '', 'g')"), 'naicsCode'],
        'naicsDescription'
      ],
      where: {
        [Op.and]: Sequelize.literal("regexp_replace(naics, '[^0-9]', '', 'g') IN (" + naicsCodes.map(a => "'" + a + "'").concat('NULL') + ")") //TODO: use replacements
      },
      order: [ 'naicsCode' ]
    })
      .then(codes => { naicsCodeDisplay = codes.map(a => a.naicsCode + ': ' + a.naicsDescription).join(', '); }));

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
      .then(ignore => {
        if (downloadRequested) {
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
            null
          )
            .then(limitations => {
              download.createDownloadFile('limitations',
                'Limitations',
                downloadDataColumns,
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
                limitations.rows,
                res);
            })
            .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
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
            []
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
                          //then, get the filtered results to be displayed (if filters were passed)
                          let filterTreatmentIds = (req.query.filterTreatmentId ? req.query.filterTreatmentId.split(';') : []);
                          let filterPointSourceCategoryCodes = (req.query.filterPointSourceCategoryCode ? req.query.filterPointSourceCategoryCode.split(';') : []);
                          let filterPollutantIds = (req.query.filterPollutantId ? decodeURIComponent(req.query.filterPollutantId).split(';') : []);

                          if (filterTreatmentIds.length > 0 || filterPointSourceCategoryCodes.length > 0 || filterPollutantIds.length > 0) {
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
                              filterTreatmentIds,
                              filterPointSourceCategoryCodes,
                              filterPollutantIds
                            )
                              .then(filteredLimitations => {
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
                          }
                          else {
                            res.status(200).send({
                              pointSourceCategoryDisplay: pointSourceCategoryDisplay,
                              sicCodeDisplay: sicCodeDisplay,
                              naicsCodeDisplay: naicsCodeDisplay,
                              pollutantDisplay: pollutantDisplay,
                              pollutantGroupDisplay: pollutantGroupDisplay,
                              limitationRangeDisplay: limitationRangeDisplay,
                              treatmentTechnologyDisplay: treatmentTechnologyDisplay,
                              treatmentTechnologyGroupDisplay: treatmentTechnologyGroupDisplay,
                              limitations: allLimitations.rows,
                              pointSourceCategories: pscs,
                              pollutants: polls,
                              treatmentTrains: treatmentTrains,
                              count: allLimitations.count
                            });
                          }
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
  },
  /**
   * @param {
   *          {keyword:string},
   *          {operator:string},
   *          {filterTreatmentId:string},
   *          {filterPointSourceCategoryCode:string},
   *          {filterPollutantId:string},
   *          {offset:number},
   *          {limit:number},
   *          {sortCol:string},
   *          {sortDir:string}
   * } req.query
   */
  keywordSearch(req, res) {
    let keywords = parseKeyword(req.query.keyword);
    let operator = (req.query.operator ? req.query.operator : 'OR');

    let downloadRequested = (req.query.download ? (req.query.download === 'true') : false);

    let sortCol = req.query.sortCol;
    let sortDir = req.query.sortDir;

    if (downloadRequested) {
      limitation.keywordSearchLimitations(keywords, operator, sortCol, sortDir, 0, null)
        .then(result => {
          download.createDownloadFile('limitations',
            'Limitations',
            downloadDataColumns,
            [
              { label: 'Keyword(s)', value: keywords.map(a => a.replace(/\%/g, '')).join(" " + operator + " ")}
            ],
            result.limitations.rows,
            res);
        })
        .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
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
        .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
    }
  }
};
