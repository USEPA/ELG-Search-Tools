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
          [Sequelize.literal("string_agg(distinct limit_type_display || ' (' || coalesce(unit_basis, '') || '): ' || lim_value || ' ' || unit, '<br/>' order by limit_type_display || ' (' || coalesce(unit_basis, '') || '): ' || lim_value || ' ' || unit)"), "rangeOfPollutantLimitations"]
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
              let rangeOfPollutantLimitationsAsTable = [];

              if(psc.rangeOfPollutantLimitations !== null) {
                ViewLimitation.findAll({
                  group: [
                    "limitationDurationTypeDisplay",
                    "limitationUnitBasis",
                    "limitationUnitCode"
                  ],
                  attributes: [
                    "limitationDurationTypeDisplay",
                    "limitationUnitBasis",
                    "limitationUnitCode",
                    [Sequelize.fn('min', Sequelize.col('lim_value')), 'minimumLimitationValue'],
                    [Sequelize.fn('max', Sequelize.col('lim_value')), 'maximumLimitationValue']
                  ],
                  where: {
                    pollutantDescription: { [Op.in]: id },
                    pointSourceCategoryCode: { [Op.eq]: psc.pointSourceCategoryCode }
                  },
                  order: [
                    "limitationDurationTypeDisplay",
                    "limitationUnitBasis",
                    "limitationUnitCode"
                  ],
                  raw: true
                })
                  .then(limitValues => {
                    limitValues.forEach(function (limitValue) {
                      let rangeAsTableRow = new Map();
                      rangeAsTableRow.minimumLimitationValue = limitValue.minimumLimitationValue;
                      rangeAsTableRow.maximumLimitationValue = limitValue.maximumLimitationValue;
                      rangeAsTableRow.limitationUnitCode = limitValue.limitationUnitCode;
                      rangeAsTableRow.limitationType = limitValue.limitationDurationTypeDisplay + (limitValue.limitationUnitBasis === null ? '' : ' (' + limitValue.limitationUnitBasis + ')');
                      rangeOfPollutantLimitationsAsTable.push(rangeAsTableRow);

                      let range = limitValue.limitationDurationTypeDisplay.replace(/\s/g, '&nbsp;') + (limitValue.limitationUnitBasis === null ? '' : '&nbsp;(' + limitValue.limitationUnitBasis.replace(/\s/g, '&nbsp;') + ')') + ': ' + limitValue.minimumLimitationValue + '&nbsp;(' + limitValue.limitationUnitCode.trim().replace(/\s/g, '&nbsp;') + ') to ' + limitValue.maximumLimitationValue + '&nbsp;(' + limitValue.limitationUnitCode.trim().replace(/\s/g, '&nbsp;') + ')';
                      //range = range.replace(/\s/g, '&nbsp;');
                      if (rangeOfPollutantLimitations === '') {
                        rangeOfPollutantLimitations = range;
                      } else {
                        rangeOfPollutantLimitations = rangeOfPollutantLimitations + '<br/>' + range;
                      }
                    });

                    psc.rangeOfPollutantLimitations = rangeOfPollutantLimitationsAsTable;
                    //psc.rangeOfPollutantLimitations = rangeOfPollutantLimitations;

                    resolve(psc);
                  })
                  .catch((error) => resolve(utilities.sanitizeError(error)));
              }
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
