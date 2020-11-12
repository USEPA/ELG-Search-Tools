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

function fillTreatmentTechnology(id, codes) {
  return new Promise(function(resolve, reject) {
    let result = {
      id: id,
      codes: codes,
      names: codes
    };

    TreatmentTechnologyCode.findAll({
      where: {
        [Op.and]: Sequelize.literal("code IN (SELECT codes FROM regexp_split_to_table('" + codes + "', '; ') AS codes)")
      }
    })
      .then(treatmentTechnologyCodes => {
        result.names = codes.split("; ").map(code => treatmentTechnologyCodes.filter(treatmentTechnologyCode => treatmentTechnologyCode.id === code)[0].name).join(" + ");
        resolve(result);
      })
      .catch(err => {
        console.error("Failed to retrieve treatment technology names: " + err);
        resolve(result);
      });
  });
}

function fillControlTechnology(controlTechnologyCode, controlTechnologyIncludesBmps, wastestreamProcessTreatmentTechnologies) {
  return new Promise(function(resolve, reject) {
    let ct = {
      id: controlTechnologyCode,
      controlTechnologyCode: controlTechnologyCode,
      pollutants: '',
      includesBmps: controlTechnologyIncludesBmps,
      wastestreamProcessTreatmentTechnologies: wastestreamProcessTreatmentTechnologies
    };

    if (wastestreamProcessTreatmentTechnologies.length) {
      WastestreamProcessTreatmentTechnologyPollutant.findAll({
        attributes: ['pollutantId'],
        where: {
          [Op.and]: Sequelize.literal("concat(processop_id, '|', treatment_id) in (" + wastestreamProcessTreatmentTechnologies.map(a => "'" + a.wastestreamProcessId + '|' + a.treatmentId + "'").join(',') + ")")
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
          ct.pollutants = pollutants.map(a => a.elgDescription).join(', ');

          resolve(ct);
        });
      });
    }
    else {
      resolve(ct);
    }
  });
}

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
  return new Promise(function(resolve, reject) {
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
          let result = new Map();
          result["id"] = treatmentTechnologyCode.id;
          result["name"] = treatmentTechnologyCode.name;
          result["description"] = treatmentTechnologyCode.description;
          result["category"] = treatmentTechnologyCode.category;
          result["variations"] = treatmentTechnologyCode.variations;

          //get lists of pscs, pollutants, and treatment trains for this technology code
          ViewWastestreamProcessTreatmentTechnologyPollutantLimitation.findOne({
            attributes: [
              ["string_agg(distinct psc_code::character varying, ';')", 'psc_code'],
              ["string_agg(distinct elg_pollutant_description, ';')", 'elg_pollutant_description'],
              ["string_agg(distinct treatment_id::character varying, ';')", 'treatment_id']
            ],
            where: {
              [Op.and]: Sequelize.literal("lower('" + id + "') IN (SELECT codes FROM regexp_split_to_table(lower(treatment_codes), '; ') AS codes)")
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
                      attributes: ["id", "codes"],
                      where: {
                        [Op.and]: Sequelize.literal("treatment_id::character varying IN (SELECT treatment_ids FROM regexp_split_to_table('" + criteriaList.treatment_id + "', ';') AS treatment_ids)")
                      }
                    })
                      .then(treatmentTechnologies => {
                        let ttPromises = [];

                        treatmentTechnologies.forEach(function(tt) {
                          ttPromises.push(fillTreatmentTechnology(tt.id, tt.codes));
                        });

                        Promise.all(ttPromises)
                          .then(tts => {
                            result.treatmentTrains = tts.sort(function (a, b) {
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
                      })
                      .catch((error) => res.status(400).send("Error! TreatmentTechnology:  " + utilities.sanitizeError(error)));
                  })
                  .catch((error) => res.status(400).send("Error! Pollutant:  " + utilities.sanitizeError(error)));
              })
                .catch((error) => res.status(400).send("Error! PointSourceCategory:  " + utilities.sanitizeError(error)));
              })
              .catch((error) => res.status(400).send("Error! ViewWastestreamProcessTreatmentTechnologyPollutantLimitation:  " + utilities.sanitizeError(error)));
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
  /*
   * @param {
   *          {treatmentId:number},
   *          {pointSourceCategoryCode:number}
   * } req.query
   */
  technologyBases(req, res) {
    // check for required query attributes and replace with defaults if missing
    try {
      let treatmentIds = (req.query.treatmentId ? req.query.treatmentId.split(',') : []);
      let pointSourceCategoryCodes = (req.query.pointSourceCategoryCode ? req.query.pointSourceCategoryCode.split(',') : []);

      //validate passed in values
      if (treatmentIds === [] || treatmentIds.some(function(treatmentId) {return utilities.parseIdAsInteger(treatmentId) === null})) {
        return res.status(400).send("Invalid value passed for treatmentId");
      }

      if (pointSourceCategoryCodes === [] || pointSourceCategoryCodes.some(function(psc) {return utilities.parseIdAsInteger(psc) === null})) {
        return res.status(400).send("Invalid value passed for pointSourceCategoryCode");
      }

      TreatmentTechnology.findAll({
        where: { id: { [Op.in]: treatmentIds } }
      })
        .then(treatmentTechnologies => {
          let ttPromises = [];

          treatmentTechnologies.forEach(function(tt) {
            ttPromises.push(fillTreatmentTechnology(tt.id, tt.codes));
          });

          Promise.all(ttPromises)
            .then(tts => {
              ViewWastestreamProcessTreatmentTechnology.findAll({
                attributes: [
                  'pointSourceCategoryCode',
                  'pointSourceCategoryName',
                  'pointSourceCategoryCfrSection',
                  'controlTechnologyCode',
                  'controlTechnologyIncludesBmps',
                  'comboSubcategory',
                  'wastestreamProcessId',
                  'wastestreamProcessTitle',
                  'wastestreamProcessSecondary',
                  'wastestreamProcessCfrSection',
                  'treatmentId',
                  [Sequelize.literal("'" + tts[0].names + "'"), 'treatmentNames'],
                  'treatmentDescription',
                  'wastestreamProcessTreatmentTechnologyNotes',
                  'wastestreamProcessTreatmentTechnologySourceTitle',
                  'wastestreamProcessTreatmentTechnologyBmpType',
                  'wastestreamProcessTreatmentTechnologyZeroDischarge'
                ],
                where: {
                  treatmentId: { [Op.in]: treatmentIds },
                  pointSourceCategoryCode: { [Op.in]: pointSourceCategoryCodes }
                },
                group: [
                  'pointSourceCategoryCode',
                  'pointSourceCategoryName',
                  'pointSourceCategoryCfrSection',
                  'controlTechnologyCode',
                  'controlTechnologyIncludesBmps',
                  'comboSubcategory',
                  'wastestreamProcessId',
                  'wastestreamProcessTitle',
                  'wastestreamProcessSecondary',
                  'wastestreamProcessCfrSection',
                  'treatmentId',
                  [Sequelize.literal("12")],
                  'treatmentDescription',
                  'wastestreamProcessTreatmentTechnologyNotes',
                  'wastestreamProcessTreatmentTechnologySourceTitle',
                  'wastestreamProcessTreatmentTechnologyBmpType',
                  'wastestreamProcessTreatmentTechnologyZeroDischarge'
                ],
                order: [
                  'pointSourceCategoryCode',
                  'controlTechnologyCode',
                  'comboSubcategory',
                  'wastestreamProcessTitle',
                  'wastestreamProcessSecondary'
                ]
              })
                .then(wastestreamProcessTreatmentTechnologies => {
                  let result = new Map();
                  result.treatmentNames = tts[0].names;
                  result.pointSourceCategoryCode = wastestreamProcessTreatmentTechnologies[0].pointSourceCategoryCode;
                  result.pointSourceCategoryName = wastestreamProcessTreatmentTechnologies[0].pointSourceCategoryName;

                  let ctPromises = [];

                  ['BPT', 'BAT', 'BCT', 'NSPS', 'PSES', 'PSNS'].forEach(function(ctCode) {
                    let wptts = wastestreamProcessTreatmentTechnologies.filter(function(wptt) { return wptt.controlTechnologyCode === ctCode; });
                    let ctIncludeBmps = false;

                    if (wptts.length > 0) {
                      ctIncludeBmps = wptts[0].controlTechnologyIncludesBmps;
                    }

                    ctPromises.push(
                      fillControlTechnology(ctCode, ctIncludeBmps, wptts)
                    );
                  });

                  Promise.all(ctPromises)
                    .then(cts => {
                      result.controlTechnologies = cts;
                      res.status(200).send(result);
                    });
                })
                .catch((error) => res.status(400).send("Error! " + utilities.sanitizeError(error)));
            });
        })
        .catch((error) => res.status(400).send("Error! " + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send("Error !" + utilities.sanitizeError(err.toString()));
    }
  },
  /*
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
  /*
   * @param {
   *          {id:string},
   *          {treatmentId:number},
   *          {pointSourceCategoryCode:number},
   *          {pollutantId:string},
   *          {download:string}
   * } req.query
   */
  limitations(req, res) {
    // check for required query attributes and replace with defaults if missing
    try {
      let id = req.query.id ? req.query.id : "";

      if (id === "") {
        return res.status(400).send("Invalid value passed for id");
      }

      let treatmentIds = (req.query.treatmentId ? req.query.treatmentId.split(';') : []);
      let pointSourceCategoryCodes = (req.query.pointSourceCategoryCode ? req.query.pointSourceCategoryCode.split(';') : []);
      let pollutantIds = (req.query.pollutantId ? req.query.pollutantId.split(';') : []);
      let downloadRequested = (req.query.download ? (req.query.download === 'true') : false);

      limitation.technologyLimitations(id, treatmentIds, pointSourceCategoryCodes, pollutantIds)
        .then(limitations => {
          if (downloadRequested) {
            TreatmentTechnologyCode.findOne({
              where: {
                id: { [Op.eq]: id }
              }
            }).then(treatmentTechnologyCode => {
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
                  { key: 'limitationValue', label: 'Value'},
                  { key: 'limitationUnitCode', label: 'Units', width: 90 },
                  { key: 'limitationDurationTypeDisplay', label: 'Type of Limitation', width: 30 }
                ],
                [
                  { label: 'Treatment Technology', value: treatmentTechnologyCode.name},
                  { label: 'Point Source Categories', value: pointSourceCategoryCodes.join(', ')},
                  { label: 'Pollutants', value: pollutantIds.join(', ')},
                  { label: 'Treatment Trains', value: (treatmentIds.length > 0 ? [...new Set(limitations.map(lim => lim.treatmentNames))].join(', ') : '')}
                ],
                limitations,
                res);
            });
          }
          else {
            res.status(200).send(limitations);
          }
        })
        .catch((error) => res.status(400).send(utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send("Error !" + utilities.sanitizeError(err.toString()));
    }
  }
};
