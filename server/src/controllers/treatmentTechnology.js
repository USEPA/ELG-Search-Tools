const utilities = require("./utilities");
const limitation = require("./limitation");

const TreatmentTechnologyCode = require("../models").TreatmentTechnologyCode;
const TreatmentTechnology = require("../models").TreatmentTechnology;
const ViewWastestreamProcessTreatmentTechnology = require("../models").ViewWastestreamProcessTreatmentTechnology;
const WastestreamProcessTreatmentTechnologyPollutant = require("../models").WastestreamProcessTreatmentTechnologyPollutant;
const ViewWastestreamProcessTreatmentTechnologyPollutantLimitation = require("../models").ViewWastestreamProcessTreatmentTechnologyPollutantLimitation;
const PointSourceCategory = require("../models").PointSourceCategory
const Pollutant = require("../models").Pollutant;
const Op = require("sequelize").Op;
const Sequelize = require("sequelize");

const download = require('./download');

/**
 * @param {
 *          {treatmentId:number},
 *          {pointSourceCategoryCode:number},
 *          {pointSourceCategoryName:string},
 *          {pointSourceSubcategories:string},
 *          {wastestreamProcesses:string},
 *          {wastestreamProcessIds:string}
 * } pointSourceCategory
 */
function fillPointSourceCategory(pointSourceCategory) {
  return new Promise(function(resolve, _ignore) {
    let result = {
      treatmentId: pointSourceCategory.treatmentId,
      pointSourceCategoryCode: pointSourceCategory.pointSourceCategoryCode,
      pointSourceCategoryName: pointSourceCategory.pointSourceCategoryName,
      pointSourceSubcategories: pointSourceCategory.pointSourceSubcategories,
      wastestreamProcesses: pointSourceCategory.wastestreamProcesses,
      pollutants: ''
    };

    WastestreamProcessTreatmentTechnologyPollutant.findOne({
      attributes: [
        [Sequelize.literal("string_agg(distinct pollutant_code::character varying, ',')"), "pollutantIds"]
      ],
      where: {
        wastestreamProcessId: { [Op.in]: pointSourceCategory.wastestreamProcessIds.split(',') }
      },
      raw: true
    })
      .then(wastestreamProcessTreatmentTechnologyPollutants => {
        Pollutant.findAll({
          attributes: ['elgDescription'],
          group: ['elgDescription'],
          where: {
            id: { [Op.in]: wastestreamProcessTreatmentTechnologyPollutants.pollutantIds.split(',') }
          },
          order: ['elgDescription']
        })
          .then(pollutants => {
            result.pollutants = pollutants.map(a => a.elgDescription).join('<br/>');
            resolve(result);
          })
          .catch((err) => {
            console.error("Failed to retrieve pollutants: " + err);
            resolve(result);
          });
      })
      .catch((err) => {
        console.error("Failed to retrieve pollutants: " + err);
        resolve(result);
      });
  });
}

function sendCriteriaList(res, result, treatmentTechnologyCodes) {
  //get lists of pscs, pollutants, and treatment trains for these technology codes
  let whereClauseOrList = [];
  treatmentTechnologyCodes.forEach(function(treatmentTechnologyCode) {
    whereClauseOrList.push({[Op.and]: Sequelize.literal("lower('" + treatmentTechnologyCode.id + "') IN (SELECT codes FROM regexp_split_to_table(lower(treatment_codes), '; ') AS codes)")});
  });

  ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findOne({
    attributes: [
      [Sequelize.literal("string_agg(distinct psc_code::character varying, ';')"), 'psc_code'],
      [Sequelize.literal("string_agg(distinct elg_pollutant_description, ';')"), 'elg_pollutant_description'],
      [Sequelize.literal("string_agg(distinct treatment_id::character varying, ';')"), 'treatment_id']
    ],
    where: {
      [Op.or]: whereClauseOrList
    },
    raw: true
  })
    .then(criteriaList => {
      PointSourceCategory.findAll({
        attributes: ["pointSourceCategoryCode", "pointSourceCategoryName"],
        where: {
          [Op.and]: Sequelize.literal("psc_code::character varying IN (SELECT psc_codes FROM regexp_split_to_table('" + criteriaList.psc_code + "', ';') AS psc_codes)")
        }
      })
        .then(pointSourceCategories => {
          result.pointSourceCategories = pointSourceCategories;

          Pollutant.findAll({
            attributes: [
              ['elg_pollutant_description', 'pollutantDescription'],
              [Sequelize.literal("string_agg(distinct pollutant_desc, '|' order by pollutant_desc)"), 'pollutantId']
            ],
            where: {
              [Op.and]: Sequelize.literal("elg_pollutant_description IN (SELECT elg_pollutant_descriptions FROM regexp_split_to_table('" + criteriaList.elg_pollutant_description + "', ';') AS elg_pollutant_descriptions)")
            },
            group: ['elg_pollutant_description']
          })
            .then(pollutants => {
              result.pollutants = pollutants;

              TreatmentTechnology.findAll({
                attributes: ["id", "codes", "names"],
                where: {
                  [Op.and]: Sequelize.literal("treatment_id::character varying IN (SELECT treatment_ids FROM regexp_split_to_table('" + criteriaList.treatment_id + "', ';') AS treatment_ids)")
                }
              })
                .then(treatmentTechnologies => {
                  result.treatmentTrains = treatmentTechnologies.sort(function (a, b) {
                    if (a.names < b.names) {
                      return -1;
                    }
                    if (a.names > b.names) {
                      return 1;
                    }
                    return 0;
                  });

                  res.status(200).send(result);
                })
                .catch((error) => res.status(400).send("Error! TreatmentTechnology:  " + utilities.sanitizeError(error)));
            })
            .catch((error) => res.status(400).send("Error! Pollutant:  " + utilities.sanitizeError(error)));
        })
        .catch((error) => res.status(400).send("Error! PointSourceCategory:  " + utilities.sanitizeError(error)));
    })
    .catch((error) => res.status(400).send("Error! ViewWastestreamProcessTreatmentTechnologyPollutantLimitation:  " + utilities.sanitizeError(error)));
}

function parseLimitationParams(query) {
  let id = query.id ? query.id : "";

  let treatmentIds = (query.treatmentId ? query.treatmentId.split(';') : []);
  let pointSourceCategoryCodes = (query.pointSourceCategoryCode ? query.pointSourceCategoryCode.split(';') : []);
  let pollutantIds = (query.pollutantId ? query.pollutantId.split(';') : []);
  let downloadRequested = utilities.parseDownload(query.download);

  let offset = query.offset ? Number(query.offset) : 0;
  let limit = query.limit ? Number(query.limit) : 100;
  let sortCol = query.sortCol;
  let sortDir = query.sortDir;

  return {
    id: id,
    treatmentIds: treatmentIds,
    pointSourceCategoryCodes: pointSourceCategoryCodes,
    pollutantIds: pollutantIds,
    downloadRequested: downloadRequested,
    offset: offset,
    limit: limit,
    sortCol: sortCol,
    sortDir: sortDir
  }
}

function validateTreatmentTechnologyCode(id, isCategory = false) {
  return new Promise((resolve, reject) => {
    try {
      if (id === "") {
        reject("Invalid value passed for id");
      } else {
        //validate that id is valid
        let whereClause = {
          id: {[Op.eq]: id}
        }
        if (isCategory) {
          whereClause = {
            category: {[Op.iLike]: '%' + id + '%'}
          }
        }
        TreatmentTechnologyCode.findOne({
          where: whereClause
        })
          .then(treatmentTechnologyCode => {
            if (treatmentTechnologyCode === null) {
              reject("Invalid value passed for id");
            } else {
              if (isCategory) {
                resolve(id);
              } else {
                resolve(treatmentTechnologyCode);
              }
            }
          })
          .catch((_ignore) => {
            reject("Invalid value passed for id");
          });
      }
    }
    catch (error) {
      reject(error);
    }
  });
}

function validateLimitationParams(treatmentIds, pointSourceCategoryCodes, pollutantIds) {
  return new Promise((resolve, reject) => {
    try {
      //validate treatmentIds
      TreatmentTechnology.findAll({
        where: {
          id: {[Op.in]: treatmentIds}
        }
      })
        .then(tIds => {
          if (tIds.length !== treatmentIds.length) {
            reject("Invalid value passed for treatmentId")
          }
          else {
            //validate pointSourceCategoryCodes
            PointSourceCategory.findAll({
              where: {
                pointSourceCategoryCode: {[Op.in]: pointSourceCategoryCodes}
              }
            })
              .then(pscs => {
                if (pscs.length !== pointSourceCategoryCodes.length) {
                  reject("Invalid value passed for pointSourceCategoryCode")
                }
                else {
                  //validate pollutantIds
                  Pollutant.findAll({
                    where: {
                      description: {[Op.in]: pollutantIds}
                    }
                  })
                    .then(pIds => {
                      if (pIds.length !== pollutantIds.length) {
                        reject("Invalid value passed for pollutantId")
                      }
                      else {
                        resolve(true);
                      }
                    })
                    .catch((_ignore) => {
                      reject("Invalid value passed for pollutantId")
                    })
                }
              })
              .catch((_ignore) => {
                reject("Invalid value passed for filterTreatmentId")
              })
          }
        })
        .catch((_ignore) => {
          reject("Invalid value passed for filterTreatmentId")
        })
    }
    catch (error) {
      reject(error);
    }
  });
}

function validateSortParams(sortCol, sortDir, offset, limit) {
  return new Promise((resolve, reject) => {
    try {
      let columnMatch = true;
      let queryColumns = limitation.attributes.concat(limitation.downloadAttributes).concat([
        'treatmentCodes',
        'treatmentNames',
        ['wptt_tech_notes', 'wastestreamProcessTreatmentTechnologyNotes'],
        'wastestreamProcessTreatmentTechnologySourceTitle'
      ]);

      if (sortCol) {
        columnMatch = (queryColumns.filter(queryColumn => {
          let columnName = Array.isArray(queryColumn) ? queryColumn[1] : queryColumn;
          return sortCol === columnName;
        }).length > 0);
      }

      if (!columnMatch) {
        reject('Invalid sortCol.');
      }
      else if (sortDir && !['ASC','DESC'].includes(sortDir.toUpperCase())) {
        reject('sortDir must be one of the following values: ASC, DESC.');
      }
      else if (offset && isNaN(offset)) {
        reject('Invalid offset: must be numeric');
      }
      else if (limit && isNaN(limit)) {
        reject('Invalid limit: must be numeric');
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
  list(req, res) {
    try {
      return ViewWastestreamProcessTreatmentTechnology.findAll({
        attributes: ['treatmentCodes'],
        group: ['treatmentCodes']
      })
        .then(wastestreamProcessTreatmentTechnologies => {
          TreatmentTechnologyCode.findAll({
            attributes: [
              "id",
              "name"
            ],
            where: {
              id: { [Op.in]: wastestreamProcessTreatmentTechnologies.map(a => a.treatmentCodes).join('; ').split('; ') }
            },
            order: ["name"]
          })
            .then(treatmentTechnologyCodes => {
              res.status(200).send(treatmentTechnologyCodes);
            })
            .catch((error) => res.status(400).send("Error! " + utilities.sanitizeError(error)));
        })
        .catch((error) => res.status(400).send("Error! " + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send("Error !" + utilities.sanitizeError(err.toString()));
    }
  },
  listCategories(req, res) {
    try {
      return TreatmentTechnologyCode.findAll({
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
        .then(treatmentTechnologyCodes => {
          res.status(200).send(treatmentTechnologyCodes.map(a => a.category).join('; ').split('; '));
        })
        .catch((error) => res.status(400).send("Error! " + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send("Error !" + utilities.sanitizeError(err.toString()));
    }
  },
  /**
   * @param {
   *          {id:string}
   * } req.params
   */
  read(req, res) {
    // check for required query attributes and replace with defaults if missing
    try {
      let id = req.params.id ? req.params.id : "";

      if (id === "") {
        return res.status(400).send("Invalid value passed for id");
      }

      return TreatmentTechnologyCode.findOne({
        where: {
          id: { [Op.eq]: id }
        }
      })
        .then(treatmentTechnologyCode => {
          if (treatmentTechnologyCode !== null) {
            let result = new Map();
            result["id"] = treatmentTechnologyCode.id;
            result["name"] = treatmentTechnologyCode.name;
            result["description"] = treatmentTechnologyCode.description;
            result["category"] = treatmentTechnologyCode.category;
            result["variations"] = treatmentTechnologyCode.variations;

            sendCriteriaList(res, result, [treatmentTechnologyCode]);
          }
          else {
            res.status(400).send("Invalid value passed for id")
          }
        })
        .catch((error) => res.status(400).send("Error! TreatmentTechnologyCode: " + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send("Error !" + utilities.sanitizeError(err.toString()));
    }
  },
  /**
   * @param {
   *          {id:string}
   * } req.params
   */
  readCategory(req, res) {
    // check for required query attributes and replace with defaults if missing
    try {
      let id = req.params.id ? req.params.id : "";

      if (id === "") {
        return res.status(400).send("Invalid value passed for id");
      }

      return TreatmentTechnologyCode.findAll({
        where: {
          category: { [Op.iLike]: '%' + id + '%' }
        }
      })
        .then(treatmentTechnologyCodes => {
          let result = new Map();
          if (treatmentTechnologyCodes.length === 0) {
            res.status(400).send("Invalid value passed for id")
          }
          else {
            result["category"] = treatmentTechnologyCodes[0].category
            result["treatmentTechnologyCodes"] = treatmentTechnologyCodes;

            sendCriteriaList(res, result, treatmentTechnologyCodes);
          }
        })
        .catch((error) => res.status(400).send("Error! TreatmentTechnologyCode: " + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send("Error !" + utilities.sanitizeError(err.toString()));
    }
  },
  /**
   * @param {
   *          {id:number}
   * } req.params
   */
  treatmentTrain(req, res) {
    let id = utilities.parseIdAsInteger(req.params.id);

    if (id === null) {
      return res.status(400).send("Invalid value passed for id");
    }

    ViewWastestreamProcessTreatmentTechnology.findAll({
      group: [
        "treatmentId",
        "pointSourceCategoryCode",
        "pointSourceCategoryName"
      ],
      attributes: [
        "treatmentId",
        "pointSourceCategoryCode",
        "pointSourceCategoryName",
        [Sequelize.literal("string_agg(distinct combo_subcat, '<br/>' order by combo_subcat)"), "pointSourceSubcategories"],
        [Sequelize.literal("string_agg(distinct processop_title, '<br/>' order by processop_title)"), "wastestreamProcesses"],
        [Sequelize.literal("string_agg(distinct processop_id::character varying, ',')"), "wastestreamProcessIds"]
      ],
      where: {
        treatmentId: { [Op.eq]: id }
      },
      raw: true
    })
      .then(pointSourceCategories => {
        let pscPromises = [];

        pointSourceCategories.forEach(function(psc) {
          console.log(psc.pointSourceSubcategories);
          pscPromises.push(fillPointSourceCategory(psc));
        });

        Promise.all(pscPromises)
          .then(pscs => {
            res.status(200).send(pscs);
          });
      })
      .catch((error) => res.status(400).send("Error! " + utilities.sanitizeError(error)));
  },
  /**
   * @param {
   *          {treatmentId:number},
   *          {pointSourceCategoryCode:number}
   * } req.query
   */
  technologyBasisLimitations(req, res) {
    // check for required query attributes and replace with defaults if missing
    try {
      let treatmentId = utilities.parseIdAsInteger(req.query.treatmentId);
      let pointSourceCategoryCode = utilities.parseIdAsInteger(req.query.pointSourceCategoryCode);

      if (treatmentId === null) {
        return res.status(400).send("Invalid value passed for treatmentId");
      }

      if (pointSourceCategoryCode === null) {
        return res.status(400).send("Invalid value passed for pointSourceCategoryCode");
      }

      limitation.technologyBasisLimitations(treatmentId, pointSourceCategoryCode)
        .then(limitations => {
          res.status(200).send(limitations);
        })
        .catch((error) => res.status(400).send(utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send("Error !" + utilities.sanitizeError(err.toString()));
    }
  },
  /**
   * @param {
   *          {id:string},
   *          {treatmentId:number},
   *          {pointSourceCategoryCode:number},
   *          {pollutantId:string},
   *          {download:string},
   *          {offset:number},
   *          {limit:number},
   *          {sortCol:string},
   *          {sortDir:string}
   * } req.query
   */
  limitations(req, res) {
    // check for required query attributes and replace with defaults if missing
    try {
      validateSortParams(req.query.sortCol, req.query.sortDir, req.query.offset, req.query.limit)
        .then(ignore => {
          let params = parseLimitationParams(req.query);

          validateTreatmentTechnologyCode(params.id)
            .then(treatmentTechnologyCode => {
              validateLimitationParams(params.treatmentIds, params.pointSourceCategoryCodes, params.pollutantIds)
                .then(ignore => {
                  if (params.downloadRequested) {
                    limitation.technologyLimitations(treatmentTechnologyCode.id, params.treatmentIds, params.pointSourceCategoryCodes, params.pollutantIds, params.sortCol, params.sortDir, true)
                      .then(limitations => {
                        limitation.technologyLimitationsForDownload(treatmentTechnologyCode.id, params.treatmentIds, params.pointSourceCategoryCodes, params.pollutantIds, params.sortCol, params.sortDir)
                          .then(dataStream => {
                            console.log('memory used: ' + Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100 / 100) +  'MB');
                            download.createDownloadFileFromStream('limitations',
                              'Limitations',
                              limitation.downloadDataColumns,
                              [
                                { label: 'Treatment Technology', value: treatmentTechnologyCode.name},
                                { label: 'Point Source Categories', value: params.pointSourceCategoryCodes.join(', ')},
                                { label: 'Pollutants', value: params.pollutantIds.join(', ')},
                                { label: 'Treatment Trains', value: (params.treatmentIds.length > 0 ? [...new Set(limitations.map(lim => lim.treatmentNames))] : []).join(', ')}
                              ],
                              dataStream,
                              res);
                          })
                          .catch((error) => res.status(400).send('Error getting data for download: ' + utilities.sanitizeError(error)));
                      })
                      .catch((error) => res.status(400).send(utilities.sanitizeError(error)));
                  }
                  else {
                    limitation.technologyLimitations(treatmentTechnologyCode.id, params.treatmentIds, params.pointSourceCategoryCodes, params.pollutantIds, params.sortCol, params.sortDir)
                      .then(limitations => {
                        res.status(200).send({
                          limitations: limitations.slice(params.offset, (params.offset+params.limit)),
                          count: limitations.length
                        });
                      })
                      .catch((error) => res.status(400).send(utilities.sanitizeError(error)));
                  }
                })
                .catch((paramValidationError) => res.status(400).send(utilities.sanitizeError(paramValidationError))) ;
            })
            .catch((validationError) => {
              res.status(400).send(validationError);
            });
        })
        .catch((sortDirValidationError) => {
          res.status(400).send(utilities.sanitizeError(sortDirValidationError));
        });
    } catch (err) {
      return res.status(400).send("Error !" + utilities.sanitizeError(err.toString()));
    }
  },
  /**
   * @param {
   *          {id:string},
   *          {treatmentId:number},
   *          {pointSourceCategoryCode:number},
   *          {pollutantId:string},
   *          {download:string},
   *          {offset:number},
   *          {limit:number},
   *          {sortCol:string},
   *          {sortDir:string}
   * } req.query
   */
  categoryLimitations(req, res) {
    // check for required query attributes and replace with defaults if missing
    try {
      validateSortParams(req.query.sortCol, req.query.sortDir, req.query.offset, req.query.limit)
        .then( ignore => {
          let params = parseLimitationParams(req.query);

          validateTreatmentTechnologyCode(params.id, true)
          .then(treatmentTechnologyCategory => {
            validateLimitationParams(params.treatmentIds, params.pointSourceCategoryCodes, params.pollutantIds)
              .then(ignore => {
                if (params.downloadRequested) {
                  limitation.technologyCategoryLimitations(treatmentTechnologyCategory, params.treatmentIds, params.pointSourceCategoryCodes, params.pollutantIds, params.sortCol, params.sortDir, 0, null, true)
                    .then(limitations => {
                      limitation.technologyCategoryLimitationsForDownload(treatmentTechnologyCategory, params.treatmentIds, params.pointSourceCategoryCodes, params.pollutantIds, params.sortCol, params.sortDir)
                        .then(dataStream => {
                          console.log('memory used: ' + Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100 / 100) +  'MB')
                          download.createDownloadFileFromStream('limitations',
                            'Limitations',
                            limitation.downloadDataColumns,
                            [
                              { label: 'Treatment Technology Category', value: treatmentTechnologyCategory},
                              { label: 'Point Source Categories', value: params.pointSourceCategoryCodes.join(', ')},
                              { label: 'Pollutants', value: params.pollutantIds.join(', ')},
                              { label: 'Treatment Trains', value: (params.treatmentIds.length > 0 ? [...new Set(limitations.map(lim => lim.treatmentNames))] : []).join(', ')}
                            ],
                            dataStream,
                            res);
                        })
                        .catch((error) => res.status(400).send('Error getting data for download: ' + utilities.sanitizeError(error)));
                    })
                    .catch((error) => res.status(400).send(utilities.sanitizeError(error)));
                }
                else {
                  limitation.technologyCategoryLimitations(treatmentTechnologyCategory, params.treatmentIds, params.pointSourceCategoryCodes, params.pollutantIds, params.sortCol, params.sortDir, params.offset, params.limit)
                    .then(limitations => {
                      console.log('memory used: ' + Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100 / 100) +  'MB')
                      res.status(200).send({
                        limitations: limitations.rows,
                        count: limitations.count
                      });
                    })
                    .catch((error) => res.status(400).send(utilities.sanitizeError(error)));
                }
              })
              .catch((paramValidationError) => res.status(400).send(utilities.sanitizeError(paramValidationError)));
          })
          .catch((validationError) => {
            res.status(400).send(utilities.sanitizeError(validationError));
          });
        })
        .catch((sortDirValidationError) => {
          res.status(400).send(utilities.sanitizeError(sortDirValidationError));
        });
    }
    catch (err) {
      return res.status(400).send("Error !" + utilities.sanitizeError(err.toString()));
    }
  }
};
