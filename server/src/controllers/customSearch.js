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
    let pollutantIds = (req.query.pollutantId ? req.query.pollutantId.split(';') : []);
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
      where: { sicCode: { [Op.in]: sicCodes } },
      order: [ 'sicCode' ]
    })
      .then(codes => { sicCodeDisplay = codes.map(a => a.sicCode + ': ' + a.sicDescription).join(', '); }));

    criteriaDisplayPromises.push(NaicsCode.findAll({
      where: { naicsCode: { [Op.in]: naicsCodes } },
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
          sortDir
        )
          .then(limitations => {
            if (downloadRequested) {
              download.createDownloadFile('limitations',
                'Limitations',
                [
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
                ],
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
                limitations,
                res);
            }
            else {
              let filterTreatmentIds = (req.query.filterTreatmentId ? req.query.filterTreatmentId.split(';') : []);
              let filterPointSourceCategoryCodes = (req.query.filterPointSourceCategoryCode ? req.query.filterPointSourceCategoryCode.split(';') : []);
              let filterPollutantIds = (req.query.filterPollutantId ? req.query.filterPollutantId.split(';') : []);

              let offset = (isNaN(req.query.offset)) ? 0 : Number(req.query.offset);
              let limit = (isNaN(req.query.limit)) ? 100 : Number(req.query.limit);

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
                            pointSourceCategoryDisplay: pointSourceCategoryDisplay,
                            sicCodeDisplay: sicCodeDisplay,
                            naicsCodeDisplay: naicsCodeDisplay,
                            pollutantDisplay: pollutantDisplay,
                            pollutantGroupDisplay: pollutantGroupDisplay,
                            limitationRangeDisplay: limitationRangeDisplay,
                            treatmentTechnologyDisplay: treatmentTechnologyDisplay,
                            treatmentTechnologyGroupDisplay: treatmentTechnologyGroupDisplay,
                            limitations: limitations.filter(limitation =>
                              (filterTreatmentIds.length === 0 || filterTreatmentIds.includes(limitation.treatmentId.toString())) &&
                              (filterPointSourceCategoryCodes.length === 0 || filterPointSourceCategoryCodes.includes(limitation.pointSourceCategoryCode.toString())) &&
                              (filterPollutantIds.length === 0 || result.pollutants.map(poll => poll.id).includes(limitation.pollutantId))
                            ).slice(offset, (offset+limit)),
                            pointSourceCategories: pscs,
                            pollutants: polls,
                            treatmentTrains: treatmentTrains,
                            count: limitations.length
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

    limitation.keywordSearchLimitations(keywords, operator, sortCol, sortDir)
      .then(result => {
        let limitations = result.limitations;

        if (downloadRequested) {
          download.createDownloadFile('limitations',
            'Limitations',
            [
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
            ],
            [
              { label: 'Keyword(s)', value: keywords.map(a => a.replace(/\%/g, '')).join(" " + operator + " ")}
            ],
            limitations,
            res);
        }
        else {
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
              let filterTreatmentIds = (req.query.filterTreatmentId ? req.query.filterTreatmentId.split(';') : []);
              let filterPointSourceCategoryCodes = (req.query.filterPointSourceCategoryCode ? req.query.filterPointSourceCategoryCode.split(';') : []);
              let filterPollutantIds = (req.query.filterPollutantId ? req.query.filterPollutantId.split(';') : []);

              let offset = (isNaN(req.query.offset)) ? 0 : Number(req.query.offset);
              let limit = (isNaN(req.query.limit)) ? 100 : Number(req.query.limit);

              res.status(200).send({
                pointSourceCategories: result.pointSourceCategoryCodes,
                pollutants: polls,
                wastestreamProcesses: result.wastestreamProcesses,
                treatmentTrains: result.treatmentTrains,
                limitations: result.limitations.filter(limitation =>
                  (filterTreatmentIds.length === 0 || filterTreatmentIds.includes(limitation.treatmentId.toString())) &&
                  (filterPointSourceCategoryCodes.length === 0 || filterPointSourceCategoryCodes.includes(limitation.pointSourceCategoryCode.toString())) &&
                  (filterPollutantIds.length === 0 || result.pollutants.map(poll => poll.id).includes(limitation.pollutantId))
                ).slice(offset, (offset+limit)),
                count: limitations.length
              });
            })
            .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
        }
      })
      .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
  }
};
