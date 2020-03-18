const utilities = require("./utilities");
//const limitation = require("./limitation");

const TreatmentTechnologyCode = require("../models").TreatmentTechnologyCode;
const TreatmentTechnology = require("../models").TreatmentTechnology;
const ViewWastestreamProcessTreatmentTechnology = require("../models").ViewWastestreamProcessTreatmentTechnology;
const WastestreamProcessTreatmentTechnologyPollutant = require("../models").WastestreamProcessTreatmentTechnologyPollutant;
const ViewLimitation = require("../models").ViewLimitation;
const Op = require("sequelize").Op;
const Sequelize = require("sequelize");

function fillTreatmentTechnology(treatmentTechnology) {
  return new Promise(function(resolve, reject) {
    TreatmentTechnologyCode.findAll({
      where: {
        [Op.and]: Sequelize.literal("code IN (SELECT codes FROM regexp_split_to_table('" + treatmentTechnology.codes + "', '; ') AS codes)")
      }
    })
      .then(treatmentTechnologyCodes => {
        let names = treatmentTechnology.codes.split("; ").map(code => treatmentTechnologyCodes.filter(treatmentTechnologyCode => treatmentTechnologyCode.id === code)[0].name).join(" + ");

        resolve({
          id: treatmentTechnology.id,
          codes: treatmentTechnology.codes,
          names: names
        });
      })
      .catch(err => {
        console.error("Failed to retrieve treatment technology names: " + err);
        resolve({
          id: treatmentTechnology.id,
          codes: treatmentTechnology.codes,
          names: treatmentTechnology.codes
        });
      });
  });
}

module.exports = {
  list(req, res) {
    try {
      return TreatmentTechnologyCode.findAll({
        attributes: [
          "id",
          "name"
        ],
        //TODO: limit to technology codes linked to PSCs that we are showing in the search tool
        order: ["name"]
      })
        .then(treatmentTechnologyCodes => {
          res.status(200).send(treatmentTechnologyCodes);
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

          TreatmentTechnology.findAll({
            attributes: ["id", "codes"],
            where: {
              [Op.and]: Sequelize.literal("lower('" + id + "') IN (SELECT codes FROM regexp_split_to_table(lower(treatment_codes), '; ') AS codes)")
              //TODO: limit to treatment technologies linked to PSCs that we are showing in the search tool
            }
          })
            .then(treatmentTechnologies => {
              let ttPromises = [];

              treatmentTechnologies.forEach(function(tt) {
                ttPromises.push(fillTreatmentTechnology(tt));
              });

              Promise.all(ttPromises)
                .then(tts => {
                  result.treatmentTrains = tts;
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
    let id = isNaN(req.params.id) ? null : (Number.isInteger(Number(req.params.id)) ? Number(req.params.id) : null);

    if (id === null) {
      return res.status(400).send("Invalid value passed for id");
    }

    WastestreamProcessTreatmentTechnologyPollutant.findAll({
      attributes: ["wastestreamProcessId", "pollutantId"],
      where: {
        treatmentId: { [Op.eq]: id }
      }
    })
      .then(wastestreamProcessTreatmentTechnologyPollutants => {
        let whereClauseList = [];

        wastestreamProcessTreatmentTechnologyPollutants.forEach(function(wastestreamProcessTreatmentTechnologyPollutant) {
          whereClauseList.push({
            [Op.and]: {
              wastestreamProcessId: { [Op.eq]: wastestreamProcessTreatmentTechnologyPollutant.wastestreamProcessId },
              pollutantId: { [Op.eq]: wastestreamProcessTreatmentTechnologyPollutant.pollutantId }
            }
          });
        });

        ViewLimitation.findAll({
          group: [
            "pointSourceCategoryCode",
            "pointSourceCategoryName"
          ],
          attributes: [
            "pointSourceCategoryCode",
            "pointSourceCategoryName",
            [Sequelize.literal("string_agg(distinct combo_subcat, ', ' order by combo_subcat)"), "pointSourceSubcategories"],
            [Sequelize.literal("string_agg(distinct processop_title, ', ' order by processop_title)"), "wastestreamProcesses"],
            [Sequelize.literal("string_agg(distinct pollutant_desc, ', ' order by pollutant_desc)"), "pollutants"]
          ],
          where: {
            [Op.or]: whereClauseList
          }
        })
          .then(limitations => {
            res.status(200).send(limitations);
          })
          .catch((error) => res.status(400).send("Error! " + utilities.sanitizeError(error)));
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
      let treatmentId = isNaN(req.query.treatmentId) ? null : (Number.isInteger(Number(req.query.treatmentId)) ? Number(req.query.treatmentId) : null);
      let pointSourceCategoryCode = isNaN(req.query.pointSourceCategoryCode) ? null : (Number.isInteger(Number(req.query.pointSourceCategoryCode)) ? Number(req.query.pointSourceCategoryCode) : null);

      if (treatmentId === null) {
        return res.status(400).send("Invalid value passed for treatmentId");
      }

      if (pointSourceCategoryCode === null) {
        return res.status(400).send("Invalid value passed for pointSourceCategoryCode");
      }

      TreatmentTechnology.findByPk(treatmentId)
        .then(treatmentTechnology => {
          fillTreatmentTechnology(treatmentTechnology)
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
                  result.wastestreamProcessTreatmentTechnologies = wastestreamProcessTreatmentTechnologies;

                  res.status(200).send(result);
                })
                .catch((error) => res.status(400).send("Error! " + utilities.sanitizeError(error)));
            });
        })
        .catch((error) => res.status(400).send("Error! " + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send("Error !" + utilities.sanitizeError(err.toString()));
    }
  }
};
