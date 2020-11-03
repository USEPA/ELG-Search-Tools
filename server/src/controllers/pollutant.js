const utilities = require("./utilities");
const limitation = require("./limitation");

const ViewLimitation = require("../models").ViewLimitation;
const Pollutant = require("../models").Pollutant;
const Op = require("sequelize").Op;
const Sequelize = require("sequelize");

const download = require('./download');

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
   *          {id:string},
   *          {download:string}
   * } req.query
   */
  read(req, res) {
    // check for required query attributes and replace with defaults if missing
    try {
      let id = req.query.id ? req.query.id.split('|') : '';

      if (id === '') {
        return res.status(400).send("Invalid value passed for id");
      }

      let downloadRequested = (req.query.download ? (req.query.download === 'true') : false);

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
          [Sequelize.literal("string_agg(distinct combo_subcat, '\n' order by combo_subcat)"), "pointSourceSubcategoriesForDownload"]
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
              let rangeOfPollutantLimitationsAsTable = [];

              ViewLimitation.findAll({
                group: [
                  "limitationDurationTypeDisplay",
                  "limitationUnitBasis",
                  "limitationUnitCode",
                  "limitationDurationDescription"
                ],
                attributes: [
                  "limitationDurationTypeDisplay",
                  "limitationUnitBasis",
                  "limitationUnitCode",
                  "limitationDurationDescription",
                  [Sequelize.literal("min(coalesce(case when lim_value ~ '^[0-9\\.\\,]+$' then lim_value::numeric else null end, case when lim_value_min ~ '^[0-9\\.\\,]+$' then lim_value_min::numeric else null end))"), 'minimumLimitationValue'],
                  [Sequelize.literal("max(coalesce(case when lim_value ~ '^[0-9\\.\\,]+$' then lim_value::numeric else null end, case when lim_value_max ~ '^[0-9\\.\\,]+$' then lim_value_max::numeric else null end))"), 'maximumLimitationValue'],
                  [Sequelize.literal("min(coalesce(case when lim_value ~ '^[0-9\\.\\,]+$' then null else lim_value end, case when lim_value_min ~ '^[0-9\\.\\,]+$' then null else lim_value_min end))"), 'minimumLimitationValueText'],
                  [Sequelize.literal("max(coalesce(case when lim_value ~ '^[0-9\\.\\,]+$' then null else lim_value end, case when lim_value_max ~ '^[0-9\\.\\,]+$' then null else lim_value_max end))"), 'maximumLimitationValueText']
                ],
                where: {
                  pollutantDescription: { [Op.in]: id },
                  pointSourceCategoryCode: { [Op.eq]: psc.pointSourceCategoryCode }
                },
                order: [
                  "limitationDurationTypeDisplay",
                  "limitationUnitBasis",
                  "limitationUnitCode",
                  "limitationDurationDescription"
                ],
                raw: true
              })
                .then(limitValues => {
                  limitValues.forEach(function (limitValue) {
                    let rangeAsTableRow = new Map();
                    rangeAsTableRow.minimumLimitationValue= (limitValue.minimumLimitationValue  ? limitValue.minimumLimitationValue : limitValue.minimumLimitationValueText);
                    rangeAsTableRow.maximumLimitationValue = (limitValue.maximumLimitationValue  ? limitValue.maximumLimitationValue : limitValue.maximumLimitationValueText);
                    rangeAsTableRow.limitationUnitCode = limitValue.limitationUnitCode;
                    rangeAsTableRow.limitationType = limitValue.limitationDurationTypeDisplay + (limitValue.limitationUnitBasis === null ? '' : ' (' + limitValue.limitationUnitBasis + ')');
                    rangeAsTableRow.limitationDurationDescription = limitValue.limitationDurationDescription
                    rangeOfPollutantLimitationsAsTable.push(rangeAsTableRow);
                  });

                  psc.rangeOfPollutantLimitations = rangeOfPollutantLimitationsAsTable;

                  resolve(psc);
                })
                .catch((error) => {
                  console.log(error);
                  psc.rangeOfPollutantLimitations = rangeOfPollutantLimitationsAsTable;
                  resolve(psc);
                });
            }));
          });

          Promise.all(pscPromises)
            .then(pscs => {
              if (downloadRequested) {
                download.createDownloadFile('[pointSourceCategories]',
                  'Point Source Categories',
                  [
                    { key: 'pointSourceCategoryCode', label: '40 CFR' },
                    { key: 'pointSourceCategoryName', label: 'Point Source Category', width: 40 },
                    { key: 'pointSourceSubcategoriesForDownload', label: 'Subcategories', width: 40, wrapText: true },
                    { key: 'rangeOfPollutantLimitations', label: 'Range of Pollutant Limitations', width: 40 }
                  ],
                  [
                    { label: 'Pollutant', value: id},
                    { label: 'Number of PSCs Referencing Pollutant', value: pscs.length}
                  ],
                  pscs,
                  res);

                /*pscs.forEach(function(row) {
                  worksheet.addRow(downloadColumns.map(function(column) {
                    if (column.key === 'pointSourceSubcategories') {
                      return row[column.key].replace(/<br\/>/g, '\n')
                    }
                    else if (column.key === 'rangeOfPollutantLimitations') {
                      let cellValue = ''
                      row[column.key].forEach(range => {
                        let rangeValue = range.minimumLimitationValue + '\t' + range.maximumLimitationValue + '\t' + range.limitationUnitCode + '\t' + range.limitationType + '\t'
                        if (cellValue === '') {
                          cellValue = rangeValue
                        }
                        else {
                          cellValue = cellValue + '\n' + rangeValue
                        }
                      });

                      return cellValue
                    }
                    else {
                      return row[column.key]
                    }
                  })).commit();
                });*/
              }
              else {
                res.status(200).send(pscs);
              }
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
   *          {pointSourceCategoryCode:number},
   *          {download:string}
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

      let downloadRequested = (req.query.download ? (req.query.download === 'true') : false);

      limitation.pollutantLimitations(pollutantIds, pointSourceCategoryCodes)
        .then(limitations => {
          if (downloadRequested) {
            download.createDownloadFile('limitations',
              'Pollutant Limitations',
              [
                {key: 'pointSourceCategoryCode', label: 'Point Source Category'},
                {key: 'controlTechnologyCode', label: 'Level of Control'},
                {key: 'pollutantDescription', label: 'Pollutant'},
                {key: 'comboSubcategory', label: 'Subpart'},
                {key: 'wastestreamProcessTitle', label: 'Process Operation/Wastestream'},
                {key: 'wastestreamProcessSecondary', label: 'Other Process/Wastestream Detail(s)'},
                {key: 'limitationDurationTypeDisplay', label: 'Type of Limitation'},
                {key: 'limitationValue', label: 'Value'},
                {key: 'limitationUnitCode', label: 'Units'},
                {key: 'limitationUnitBasis', label: 'Limitation Basis'}
              ],
              [
              ],
              limitations.limitations,
              res);
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
