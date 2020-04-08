const utilities = require("./utilities");
const limitation = require("./limitation");

const ViewLimitation = require("../models").ViewLimitation;
const Pollutant = require("../models").Pollutant;
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
          Pollutant.findAll({
            attributes: [
              ['elg_pollutant_description', 'pollutantDescription'],
              [Sequelize.literal("string_agg(distinct pollutant_desc, '|' order by pollutant_desc)"), 'pollutantId']
            ],
            where: {
              id: { [Op.in]: pollutants.map(a => a.pollutantId) }
            },
            group: ['elg_pollutant_description']
          })
            .then(polls => {
              res.status(200).send(polls);
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
      let id = req.params.id ? req.params.id.split('|') : '';

      if (id === '') {
        return res.status(400).send("Invalid value passed for id");
      }

      //get ranges of limitations, then group by PSC
      return ViewLimitation.findAll({
        group: [
          ["elg_pollutant_description", 'pollutantDescription'],
          "pointSourceCategoryCode",
          "pointSourceCategoryName"
        ],
        attributes: [
          [Sequelize.literal("string_agg(distinct pollutant_code::text, ',')"), "pollutantId"],
          ["elg_pollutant_description", 'pollutantDescription'],
          "pointSourceCategoryCode",
          "pointSourceCategoryName",
          [Sequelize.literal("string_agg(distinct combo_subcat, '<br/>' order by combo_subcat)"), "pointSourceSubcategories"],
          [Sequelize.literal("string_agg(distinct limit_duration_description || ' (' || coalesce(unit_basis, '') || '): ' || lim_value || ' ' || unit, '<br/>' order by limit_duration_description || ' (' || coalesce(unit_basis, '') || '): ' || lim_value || ' ' || unit)"), "rangeOfPollutantLimitations"]
        ],
        where: {
          pollutantDescription: { [Op.in]: id }
        },
        order: ['pointSourceCategoryCode'],
        raw: true
      })
        .then(pointSourceCategories => {
          let pscPromises = [];

          pointSourceCategories.forEach(function(psc) {
            pscPromises.push(new Promise(function(resolve, reject) {
              let rangeOfPollutantLimitations = '';

              if(psc.rangeOfPollutantLimitations !== null) {
                let limitationValues = [];
                psc.rangeOfPollutantLimitations.split('<br/>').forEach(function(lim) {
                  let limDetails = lim.split(': ');

                  limitationValues.push({ type: limDetails[0].replace('()', ''), value: limDetails[1] });
                });

                let groupedLimitationValues = [];
                limitationValues.forEach(function(limValue) {
                  let filteredGroupedLimitationValues = groupedLimitationValues.filter(groupedLimitationValue => groupedLimitationValue.type === limValue.type);
                  if (filteredGroupedLimitationValues.length === 0) {
                    groupedLimitationValues.push({ type: limValue.type, values: [limValue.value] })
                  } else {
                    groupedLimitationValues[0].values.push(limValue.value)
                  }
                });

                groupedLimitationValues.forEach(function(groupedLimitationValue) {
                  let range = groupedLimitationValue.type + ': ' + groupedLimitationValue.values[0] + ' to ' + groupedLimitationValue.values[groupedLimitationValue.values.length - 1];
                  if (rangeOfPollutantLimitations === '') {
                    rangeOfPollutantLimitations = range;
                  } else {
                    rangeOfPollutantLimitations = rangeOfPollutantLimitations + '<br/>' + range;
                  }
                });
              }

              psc.rangeOfPollutantLimitations = rangeOfPollutantLimitations;

              resolve(psc);
            }));
          });

          Promise.all(pscPromises)
            .then(pscs => {
              res.status(200).send(pscs);
            })
            .catch((error) => res.status(400).send("Error! " + utilities.sanitizeError(error)));
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
      let pollutantIds = (req.query.pollutantId ? req.query.pollutantId.split(',') : []);
      let pointSourceCategoryCodes = (req.query.pointSourceCategoryCode ? req.query.pointSourceCategoryCode.split(',') : []);

      //validate passed in values
      if (pollutantIds === [] || pollutantIds.some(function(pollutantId) {return utilities.parseIdAsInteger(pollutantId) === null})) {
        return res.status(400).send("Invalid value passed for pollutantId");
      }

      if (pointSourceCategoryCodes === [] || pointSourceCategoryCodes.some(function(psc) {return utilities.parseIdAsInteger(psc) === null})) {
        return res.status(400).send("Invalid value passed for pointSourceCategoryCode");
      }

      limitation.pollutantLimitations(pollutantIds, pointSourceCategoryCodes)
        .then(limitations => {
          res.status(200).send(limitations);
        })
        .catch((error) => res.status(400).send(utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send("Error !" + utilities.sanitizeError(err.toString()));
    }
  }
};
