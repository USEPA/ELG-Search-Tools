const utilities = require('./utilities');

const PointSourceCategory = require('../models').PointSourceCategory;
const PointSourceSubcategory = require('../models').PointSourceSubcategory;
const PointSourceCategoryNaicsCode = require('../models').PointSourceCategoryNaicsCode;
const PointSourceCategorySicCode = require('../models').PointSourceCategorySicCode;
const ViewGeneralProvision = require('../models').ViewGeneralProvision;
const ViewDefinition = require('../models').ViewDefinition;
const CitationHistory = require('../models').CitationHistory;
const ViewWastestreamProcessTreatmentTechnology = require('../models').ViewWastestreamProcessTreatmentTechnology;
const ViewLimitation = require('../models').ViewLimitation;
const TreatmentTechnology = require('../models').TreatmentTechnology;
const TreatmentTechnologyCode = require('../models').TreatmentTechnologyCode;
const ViewWastestreamProcessTreatmentTechnologyPollutant = require('../models').ViewWastestreamProcessTreatmentTechnologyPollutant;
const Pollutant  = require('../models').Pollutant;
const Op = require('sequelize').Op
const Sequelize = require("sequelize");

function fillSubcategoryForCfr(subcategory) {
  return new Promise( function(resolve, reject) {
    let sub = {
      'id': subcategory.id,
      'pointSourceCategoryCode': subcategory.pointSourceCategoryCode,
      'comboSubcategory': subcategory.comboSubcategory,
      'applicabilityProvisions': [],
      'monitoringRequirementProvisions': [],
      'bmpProvisions': [],
      'otherProvisions': []
    };

    let attributes = [
      'cfrSection',
      'title',
      [Sequelize.literal("replace(genprov_desc, '\\u00A7', U&'\\00A7')"), 'description'],
      'cfrHasAdditionalDetails',
      'type'
    ];

    let subCategoryIdWhereClause = { [Op.eq]: sub.id }
    if (sub.comboSubcategory === 'All') {
      subCategoryIdWhereClause = { [Op.eq]: null }
    }

    ViewGeneralProvision.findAll({
      attributes: attributes,
      where: {
        pointSourceCategoryCode: { [Op.eq]: sub.pointSourceCategoryCode },
        type: { [Op.ne]: null },
        subcategoryId: subCategoryIdWhereClause
      },
      order: ['cfrSection']
    })
      .then(provisions => {
        sub.applicabilityProvisions = provisions.filter(function(provision) { return provision.type === 'applicability' } );
        sub.monitoringRequirementProvisions = provisions.filter(function(provision) { return provision.type === 'monitoringRequirement' } );
        sub.bmpProvisions = provisions.filter(function(provision) { return provision.type === 'bmp' } );
        sub.otherProvisions = provisions.filter(function(provision) { return provision.type === 'other' } );
        resolve(sub);
      });
  })
}

function fillSubcategoryForDefinitions(subcategory) {
  return new Promise( function(resolve, reject) {
    let sub = {
      'id': subcategory.id,
      'pointSourceCategoryCode': subcategory.pointSourceCategoryCode,
      'comboSubcategory': subcategory.comboSubcategory,
      'definitions': []
    };

    let attributes = [
      'term',
      'definition',
      'cfrHasAdditionalDetails'
    ];

    let subCategoryIdWhereClause = { [Op.eq]: sub.id }
    if (sub.comboSubcategory === 'General Definitions') {
      subCategoryIdWhereClause = { [Op.eq]: null }
    }

    ViewDefinition.findAll({
      attributes: attributes,
      where: {
        pointSourceCategoryCode: { [Op.eq]: sub.pointSourceCategoryCode },
        subcategoryId: subCategoryIdWhereClause
      },
      order: ['term']
    })
      .then(definitions => {
        sub.definitions = definitions;
        resolve(sub);
      });
  })
}

module.exports = {
  list(req, res) {
    try {
      return PointSourceCategory.findAll({
        attributes: ['pointSourceCategoryCode', 'pointSourceCategoryName'],
        where: {
          includeInSearchTool: { [Op.eq]: true },
        },
        order: ['pointSourceCategoryCode'],
      })
        .then((pointSourceCategories) => {
          res.status(200).send(pointSourceCategories);
        })
        .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  },
  /**
   * @param {
   *          {id:number}
   * } req.params
   */
  read(req, res) {
    // check for required query attributes and replace with defaults if missing
    try {
      let id = utilities.parseIdAsInteger(req.params.id);

      if (id === null) {
        return res.status(400).send('Invalid value passed for id')
      }

      return PointSourceCategory.findByPk(id, {
        attributes: ['pointSourceCategoryCode', 'pointSourceCategoryName']
      })
        .then((pointSourceCategory) => {
          let result = new Map();

          if(pointSourceCategory) {
            result['pointSourceCategoryCode'] = pointSourceCategory.pointSourceCategoryCode;
            result['pointSourceCategoryName'] = pointSourceCategory.pointSourceCategoryName;

            PointSourceSubcategory.findAll({
              attributes: ['id', 'pointSourceSubcategoryCode', 'pointSourceSubcategoryTitle', 'comboSubcategory'],
              where: {
                pointSourceCategoryCode: { [Op.eq]: id },
              },
              order: [Sequelize.literal("length(subcat_code)"), 'pointSourceSubcategoryCode'],
            })
              .then((pointSourceSubcategories) => {
                result['pointSourceSubcategories'] = pointSourceSubcategories;
                result['technologyNames'] = '';
                result['pollutants'] = '';

                ViewWastestreamProcessTreatmentTechnology.findAll({
                  attributes: ['wastestreamProcessId', 'treatmentId'],
                  where: {
                    pointSourceCategoryCode: { [Op.eq]: id }
                  }
                }).then((wastestreamProcessTreatmentTechnologies) => {
                  if (wastestreamProcessTreatmentTechnologies.length > 0) {
                    TreatmentTechnology.findAll({
                      attributes: ['codes'],
                      where: {
                        id: { [Op.in]: wastestreamProcessTreatmentTechnologies.map(a => a.treatmentId) }
                      }
                    }).then(treatmentTechnologies => {
                      TreatmentTechnologyCode.findAll({
                        attributes: ['name'],
                        where: {
                          code: { [Op.in]: treatmentTechnologies.map(a => a.codes).join('; ').split('; ') }
                        },
                        group: ['name'],
                        order: ['name']
                      })
                        .then((treatmentTechnologyCodes) => {
                          ViewWastestreamProcessTreatmentTechnologyPollutant.findAll({
                            attributes: ['pollutantId'],
                            where: {
                              wastestreamProcessId: { [Op.in]: wastestreamProcessTreatmentTechnologies.map(a => a.wastestreamProcessId) },
                              treatmentId: { [Op.in]: wastestreamProcessTreatmentTechnologies.map(a => a.treatmentId) }
                            }
                          }).then(wastestreamProcessTreatmentTechnologyPollutants => {
                            Pollutant.findAll({
                              attributes: ['elgDescription'],
                              where: {
                                id: { [Op.in]: wastestreamProcessTreatmentTechnologyPollutants.map(a => a.pollutantId) }
                              },
                              group: ['elgDescription'],
                              order: ['elgDescription']
                            }).then(pollutants => {
                              result['technologyNames'] = treatmentTechnologyCodes.map(a => a.name).join('; ');
                              result['pollutants'] = pollutants.map(a => a.elgDescription).join('; ');

                              res.status(200).send(result);
                            });
                          });
                        });
                    })
                  }
                  else {
                    // no treatment technologies are linked to this point source category
                    // use limitations to get pollutants
                    ViewLimitation.findAll( {
                      attributes: [
                        [Sequelize.fn('DISTINCT', Sequelize.col('pollutant_code')), 'pollutantId'],
                        [Sequelize.col('elg_pollutant_description'), 'elgPollutantDescription']
                      ],
                      where: {
                        pointSourceCategoryCode: { [Op.eq]: id },
                      }
                    })
                      .then(pollutants => {
                        result['pollutants'] = pollutants.map(a => a.elgPollutantDescription).join('; ').split('; ').sort().filter(function(value, index, self) {
                          return self.indexOf(value) === index;
                        }).join('; ');

                        res.status(200).send(result);
                      })
                  }
                }).catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
              })
              .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
          }
          else {
            res.status(200).send(result);
          }
        })
        .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  },
  /**
   * @param {
   *          {id:number}
   * } req.params
   */
  cfr(req, res) {
    // check for required query attributes and replace with defaults if missing
    try {
      let pointSourceCategoryCode = utilities.parseIdAsInteger(req.params.id);

      if (pointSourceCategoryCode === null) {
        return res.status(400).send('Invalid value passed for pointSourceCategoryCode')
      }

      return PointSourceCategory.findByPk(pointSourceCategoryCode, {
        attributes: [
          'pointSourceCategoryCode',
          'pointSourceCategoryName',
          'initialPromulgationDate',
          'mostRecentRevisionDate'
        ]
      })
        .then((pointSourceCategory) => {
          let result = new Map();

          if(pointSourceCategory) {
            result['pointSourceCategoryCode'] = pointSourceCategory.pointSourceCategoryCode;
            result['pointSourceCategoryName'] = pointSourceCategory.pointSourceCategoryName;
            result['initialPromulgationDate'] = pointSourceCategory.initialPromulgationDate;
            result['mostRecentRevisionDate'] = pointSourceCategory.mostRecentRevisionDate;

            PointSourceCategoryNaicsCode.findAll({
              attributes: [
                [Sequelize.literal("regexp_replace(naics, '[^0-9]', '', 'g')"), 'naicsCode'],
                [Sequelize.literal('(select "NaicsCode".naics_desc from "elg_search"."NaicsCode" where "NaicsCode".naics = "PointSourceCategoryNaicsCode".naics)'), 'naicsDescription']
              ],
              where: {
                pointSourceCategoryCode: { [Op.eq]: pointSourceCategoryCode }
              },
              order: ['naicsCode']
            })
              .then((pointSourceCategoryNaicsCodes) => {
                result['naicsCodes'] = pointSourceCategoryNaicsCodes;

                PointSourceCategorySicCode.findAll({
                  attributes: [
                    [Sequelize.literal("regexp_replace(sic, '[^0-9]', '', 'g')"), 'sicCode'],
                    [Sequelize.literal('(select "SicCode".sic_desc from "elg_search"."SicCode" where "SicCode".sic = "PointSourceCategorySicCode".sic)'), 'sicDescription']
                  ],
                  where: {
                    generalPointSourceCategoryCode: { [Op.eq]: pointSourceCategoryCode }
                  },
                  order: ['sicCode']
                })
                  .then((pointSourceCategorySicCodes) => {
                    result['sicCodes'] = pointSourceCategorySicCodes;

                    PointSourceSubcategory.findAll({
                      attributes: [
                        'id',
                        'pointSourceCategoryCode',
                        'comboSubcategory',
                        'pointSourceSubcategoryCfrSection'
                      ],
                      where: {
                        pointSourceCategoryCode: { [Op.eq]: pointSourceCategoryCode },
                      },
                      order: [
                        Sequelize.literal("length(subcat_code)"),
                        'comboSubcategory'
                      ]
                    })
                      .then((subcategories) => {
                        subcategories.unshift({id: -1, pointSourceCategoryCode: pointSourceCategoryCode, comboSubcategory: 'All', pointSourceSubcategoryCfrSection: ''})

                        let subcategoryPromises = [];

                        //get provisions for each subcategory, grouped by type
                        subcategories.forEach(function(subcategory) {
                          subcategoryPromises.push(fillSubcategoryForCfr(subcategory))
                        });

                        Promise.all(subcategoryPromises).then(filledSubcategories => {
                          result['subcategories'] = filledSubcategories;

                          res.status(200).send(result);
                        })
                      })
                      .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
                  })
                  .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
              })
              .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
          }
          else {
            res.status(200).send(result);
          }
        })
        .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  },
  /**
   * @param {
   *          {id:number}
   * } req.params
   */
  definitions(req, res) {
    // check for required query attributes and replace with defaults if missing
    try {
      let pointSourceCategoryCode = utilities.parseIdAsInteger(req.params.id);

      if (pointSourceCategoryCode === null) {
        return res.status(400).send('Invalid value passed for pointSourceCategoryCode')
      }

      return PointSourceCategory.findByPk(pointSourceCategoryCode, {
        attributes: [
          'pointSourceCategoryCode',
          'pointSourceCategoryName'
        ]
      })
        .then((pointSourceCategory) => {
          let result = new Map();

          if(pointSourceCategory) {
            result['pointSourceCategoryCode'] = pointSourceCategory.pointSourceCategoryCode;
            result['pointSourceCategoryName'] = pointSourceCategory.pointSourceCategoryName;

            PointSourceSubcategory.findAll({
              attributes: [
                'id',
                'pointSourceCategoryCode',
                'comboSubcategory',
                'pointSourceSubcategoryCfrSection'
              ],
              where: {
                pointSourceCategoryCode: { [Op.eq]: pointSourceCategoryCode },
              },
              order: [
                'comboSubcategory'
              ]
            })
              .then((subcategories) => {
                subcategories.unshift({id: -1, pointSourceCategoryCode: pointSourceCategoryCode, comboSubcategory: 'General Definitions', pointSourceSubcategoryCfrSection: ''})

                let subcategoryPromises = [];

                //get provisions for each subcategory, grouped by type
                subcategories.forEach(function(subcategory) {
                  subcategoryPromises.push(fillSubcategoryForDefinitions(subcategory))
                });

                Promise.all(subcategoryPromises).then(filledSubcategories => {
                  result['subcategories'] = filledSubcategories;

                  res.status(200).send(result);
                })
              })
              .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
          }
          else {
            res.status(200).send(result);
          }
        })
        .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  },
  /**
   * @param {
   *          {id:number}
   * } req.params
   */
  citationHistory(req, res) {
    // check for required query attributes and replace with defaults if missing
    try {
      let pointSourceCategoryCode = utilities.parseIdAsInteger(req.params.id);

      if (pointSourceCategoryCode === null) {
        return res.status(400).send('Invalid value passed for pointSourceCategoryCode')
      }

      return PointSourceCategory.findByPk(pointSourceCategoryCode, {
        attributes: [
          'pointSourceCategoryCode',
          'pointSourceCategoryName'
        ]
      })
        .then((pointSourceCategory) => {
          let result = new Map();

          if(pointSourceCategory) {
            result['pointSourceCategoryCode'] = pointSourceCategory.pointSourceCategoryCode;
            result['pointSourceCategoryName'] = pointSourceCategory.pointSourceCategoryName;

            CitationHistory.findAll({
              attributes: [
                'cfrSection',
                'subcategory',
                'description',
                'publicationDate',
                'federalRegisterNoticeInCfr',
                'federalRegisterNoticeFirstPage'
              ],
              where: {
                pointSourceCategoryCode: { [Op.eq]: pointSourceCategoryCode },
              },
              order: [
                'cfrSection',
                'publicationDate'
              ]
            })
              .then((citationHistories) => {
                res.status(200).send(citationHistories);
              })
              .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
          }
          else {
            res.status(200).send(result);
          }
        })
        .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  }
};
