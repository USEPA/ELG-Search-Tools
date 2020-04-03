const utilities = require("./utilities");
const limitation = require("./limitation");

const TreatmentTechnologyCode = require("../models").TreatmentTechnologyCode;
const TreatmentTechnology = require("../models").TreatmentTechnology;
const ViewWastestreamProcessTreatmentTechnology = require("../models").ViewWastestreamProcessTreatmentTechnology;
const WastestreamProcessTreatmentTechnologyPollutant = require("../models").WastestreamProcessTreatmentTechnologyPollutant;
const Pollutant = require("../models").Pollutant;
const Op = require("sequelize").Op;
const Sequelize = require("sequelize");

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
          id: { [Op.iLike]: '%' + id + '%' }
        }
      })
        .then(treatmentTechnologyCode => {
          let result = new Map();
          result["id"] = treatmentTechnologyCode.id;
          result["name"] = treatmentTechnologyCode.name;
          result["description"] = treatmentTechnologyCode.description;
          result["category"] = treatmentTechnologyCode.category;
          result["variations"] = treatmentTechnologyCode.variations;

          ViewWastestreamProcessTreatmentTechnology.findAll({
            attributes: ["treatmentId", "treatmentCodes", 'treatmentDescription'],
            where: {
              [Op.and]: Sequelize.literal("lower('" + id + "') IN (SELECT codes FROM regexp_split_to_table(lower(treatment_codes), '; ') AS codes)")
            },
            group: ["treatmentId", "treatmentCodes", 'treatmentDescription']
          })
            .then(treatmentTechnologies => {
              let ttPromises = [];

              treatmentTechnologies.forEach(function(tt) {
                ttPromises.push(fillTreatmentTechnology(tt.treatmentId, tt.treatmentCodes));
              });

              Promise.all(ttPromises)
                .then(tts => {
                  result.treatmentTrains = tts.sort(function(a, b) {
                    if (a.names < b.names) {
                      return -1;
                    }
                    if (a.names > b.names) {
                      return 1;
                    }
                    return 0;
                  });
                  res.status(200).send(result);
                });
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
      let treatmentId = utilities.parseIdAsInteger(req.query.treatmentId);
      let pointSourceCategoryCode = utilities.parseIdAsInteger(req.query.pointSourceCategoryCode);

      if (treatmentId === null) {
        return res.status(400).send("Invalid value passed for treatmentId");
      }

      if (pointSourceCategoryCode === null) {
        return res.status(400).send("Invalid value passed for pointSourceCategoryCode");
      }

      TreatmentTechnology.findByPk(treatmentId)
        .then(treatmentTechnology => {
          fillTreatmentTechnology(treatmentTechnology.id, treatmentTechnology.codes)
            .then(tt => {
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
                  [Sequelize.literal("'" + tt.names + "'"), 'treatmentNames'],
                  'treatmentDescription',
                  'wastestreamProcessTreatmentTechnologyNotes',
                  'wastestreamProcessZeroDischarge'
                ],
                where: {
                  treatmentId: { [Op.eq]: treatmentId },
                  pointSourceCategoryCode: { [Op.eq]: pointSourceCategoryCode }
                }
              })
                .then(wastestreamProcessTreatmentTechnologies => {
                  let result = new Map();
                  result.treatmentNames = tt.names;
                  result.pointSourceCategoryCode = pointSourceCategoryCode;
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
  limitations(req, res) {
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
  }
};
