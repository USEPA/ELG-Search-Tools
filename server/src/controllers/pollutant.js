const utilities = require("./utilities");
const limitation = require("./limitation");

const ViewLimitation = require("../models").ViewLimitation;
const Op = require("sequelize").Op;
const Sequelize = require("sequelize");

module.exports = {
  list(req, res) {
    try {
      return ViewLimitation.findAll({
        attributes: [
          [Sequelize.fn("DISTINCT", Sequelize.col("pollutant_code")), "pollutantId"],
          [Sequelize.col("pollutant_desc"), "pollutantDescription"]
        ],
        order: ["pollutant_desc"]
      })
        .then(pollutants => {
          res.status(200).send(pollutants);
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
  read(req, res) {
    // check for required query attributes and replace with defaults if missing
    try {
      let id = isNaN(req.params.id) ? null : (Number.isInteger(Number(req.params.id)) ? Number(req.params.id) : null);

      if (id === null) {
        return res.status(400).send("Invalid value passed for id");
      }

      return ViewLimitation.findAll({
        group: [
          "pollutantId",
          "pollutantDescription",
          "pointSourceCategoryCode",
          "pointSourceCategoryName"
        ],
        attributes: [
          "pollutantId",
          "pollutantDescription",
          "pointSourceCategoryCode",
          "pointSourceCategoryName",
          [Sequelize.literal("string_agg(distinct combo_subcat, '<br/>' order by combo_subcat)"), "pointSourceSubcategories"],
          [Sequelize.literal("string_agg(distinct processop_title, '<br/>' order by processop_title)"), "wastestreamProcesses"]
        ],
        where: {
          pollutantId: { [Op.eq]: id }
        }
      })
        .then(limitations => {
          res.status(200).send(limitations);
        })
        .catch((error) => res.status(400).send("Error! " + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send("Error !" + utilities.sanitizeError(err.toString()));
    }
  },
  /*
   * @param {
   *          {pollutantId:number},
   *          {pointSourceCategoryCode:number}
   * } req.query
   */
  limitations(req, res) {
    // check for required query attributes and replace with defaults if missing
    try {
      let pollutantId = isNaN(req.query.pollutantId) ? null : (Number.isInteger(Number(req.query.pollutantId)) ? Number(req.query.pollutantId) : null);
      let pointSourceCategoryCode = isNaN(req.query.pointSourceCategoryCode) ? null : (Number.isInteger(Number(req.query.pointSourceCategoryCode)) ? Number(req.query.pointSourceCategoryCode) : null);

      if (pollutantId === null) {
        return res.status(400).send("Invalid value passed for pollutantId");
      }

      if (pointSourceCategoryCode === null) {
        return res.status(400).send("Invalid value passed for pointSourceCategoryCode");
      }

      limitation.pollutantLimitations(pollutantId, pointSourceCategoryCode)
        .then(limitations => {
          res.status(200).send(limitations);
        })
        .catch((error) => res.status(400).send(utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send("Error !" + utilities.sanitizeError(err.toString()));
    }
  }
};
