const utilities = require("./utilities");
const limitation = require("./limitation");

const ViewLimitation = require("../models").ViewLimitation;
const Pollutant = require("../models").Pollutant;
const PollutantGroup = require("../models").PollutantGroup;
const Op = require("sequelize").Op;
const Sequelize = require("sequelize");

const download = require('./download');

function buildRangeOfLimitations(limitValues) {
  return new Promise(function(resolve, reject) {
    let rangeOfPollutantLimitationsAsTable = [];
    let rangeOfPollutantLimitationsForDownload = [];

    limitValues.forEach(function (limitValue) {
      let rangeAsTableRow = new Map();
      rangeAsTableRow.minimumLimitationValue = (limitValue.minimumLimitationValue  ? limitValue.minimumLimitationValue : limitValue.minimumLimitationValueText);
      rangeAsTableRow.maximumLimitationValue = (limitValue.maximumLimitationValue  ? limitValue.maximumLimitationValue : limitValue.maximumLimitationValueText);
      rangeAsTableRow.limitationUnitCode = (limitValue.limitationUnitCode ? limitValue.limitationUnitCode.trim() : null);
      rangeAsTableRow.limitationType = limitValue.limitationDurationTypeDisplay + (limitValue.limitationUnitBasis === null ? '' : ' (' + limitValue.limitationUnitBasis + ')');
      rangeAsTableRow.limitationDurationDescription = limitValue.limitationDurationDescription
      rangeOfPollutantLimitationsAsTable.push(rangeAsTableRow);
      rangeOfPollutantLimitationsForDownload.push(rangeAsTableRow.minimumLimitationValue + ' (' + rangeAsTableRow.limitationUnitCode + ') - ' + rangeAsTableRow.maximumLimitationValue + ' (' + rangeAsTableRow.limitationUnitCode + ') ' + rangeAsTableRow.limitationType);
    });

    resolve({rangeOfPollutantLimitations: rangeOfPollutantLimitationsAsTable, rangeOfPollutantLimitationsForDownload: rangeOfPollutantLimitationsForDownload.join('\n')});
  });
}

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
  listCategories(req, res) {
    try {
      return ViewLimitation.findAll({
        attributes: [
          [Sequelize.fn("DISTINCT", Sequelize.col("pollutant_code")), "pollutantId"],
          [Sequelize.col("pollutant_desc"), "pollutantDescription"]
        ],
        order: ["pollutant_desc"]
      })
        .then(pollutants => {
          Pollutant.findOne({
            attributes: [
              [Sequelize.literal("string_agg(distinct pollutant_groups::text, ';')"), 'pollutantGroups']
            ],
            where: {
              id: { [Op.in]: pollutants.map(a => a.pollutantId) },
              pollutantGroups: { [Op.ne]: null }
            },
            raw: true
          })
            .then(polls => {
              PollutantGroup.findAll({
                where: {
                  id: { [Op.in]: polls.pollutantGroups.split(';') }
                },
                order: ['description']
              })
                .then(pollutantGroups => {
                  res.status(200).send(pollutantGroups);
                })
                .catch((error) => res.status(400).send("Error! " + utilities.sanitizeError(error)));
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
      console.log(req.query.id);
      let id = req.query.id ? req.query.id.split('|') : '';
      console.log(id);

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
                  [Sequelize.literal("min(coalesce(case when lim_value ~ '^[0-9\\.\\,]+$' then regexp_replace(lim_value, ',', '', 'g')::numeric else null end, case when lim_value_min ~ '^[0-9\\.\\,]+$' then lim_value_min::numeric else null end))"), 'minimumLimitationValue'],
                  [Sequelize.literal("max(coalesce(case when lim_value ~ '^[0-9\\.\\,]+$' then regexp_replace(lim_value, ',', '', 'g')::numeric else null end, case when lim_value_max ~ '^[0-9\\.\\,]+$' then lim_value_max::numeric else null end))"), 'maximumLimitationValue'],
                  [Sequelize.literal("min(coalesce(case when lim_value ~ '^[0-9\\.\\,]+$' then null else lim_value end, case when lim_value_min ~ '^[0-9\\.\\,]+$' then null else lim_value_min end))"), 'minimumLimitationValueText'],
                  [Sequelize.literal("max(coalesce(case when lim_value ~ '^[0-9\\.\\,]+$' then null else lim_value end, case when lim_value_max ~ '^[0-9\\.\\,]+$' then null else lim_value_max end))"), 'maximumLimitationValueText']
                ],
                where: {
                  pollutantDescription: { [Op.in]: id },
                  pointSourceCategoryCode: { [Op.eq]: psc.pointSourceCategoryCode },
                  alternateLimitFlag: {
                    [Op.or]: [
                      { [Op.ne]: 'X by Factor' },
                      { [Op.eq]: null }
                    ]
                  }
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
                  buildRangeOfLimitations(limitValues)
                    .then(rangeOfLimitations => {
                      psc.rangeOfPollutantLimitations = rangeOfLimitations.rangeOfPollutantLimitations;
                      psc.rangeOfPollutantLimitationsForDownload = rangeOfLimitations.rangeOfPollutantLimitationsForDownload;
                      resolve(psc);
                    })
                    .catch(error => {
                      console.log(error);
                      psc.rangeOfPollutantLimitations = [];
                      psc.rangeOfPollutantLimitationsForDownload = '';
                      resolve(psc);
                    });
                })
                .catch((error) => {
                  console.log(error);
                  psc.rangeOfPollutantLimitations = [];
                  psc.rangeOfPollutantLimitationsForDownload = '';
                  resolve(psc);
                });
            }));
          });

          Promise.all(pscPromises)
            .then(pscs => {
              if (downloadRequested) {
                Pollutant.findOne({
                  group: ["elgDescription"],
                  attributes: ["elgDescription"],
                  where: {
                    description: { [Op.in]: id }
                  }
                })
                  .then(pollutant => {
                    download.createDownloadFile('[pointSourceCategories]',
                      'Point Source Categories',
                      [
                        { key: 'pointSourceCategoryCode', label: '40 CFR' },
                        { key: 'pointSourceCategoryName', label: 'Point Source Category', width: 60 },
                        { key: 'pointSourceSubcategoriesForDownload', label: 'Subcategories', width: 40, wrapText: true },
                        { key: 'rangeOfPollutantLimitationsForDownload', label: 'Range of Pollutant Limitations', width: 220, wrapText: true }
                      ],
                      [
                        { label: 'Pollutant', value: pollutant.elgDescription},
                        { label: 'Number of PSCs Referencing Pollutant', value: pscs.length}
                      ],
                      pscs,
                      res);
                  });

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
  /**
   * @param {
   *          {id:string},
   *          {download:string}
   * } req.query
   */
  readCategory(req, res) {
    // check for required query attributes and replace with defaults if missing
    try {
      let id = req.query.id ? req.query.id : '';

      if (id === '') {
        return res.status(400).send("Invalid value passed for id");
      }

      let downloadRequested = (req.query.download ? (req.query.download === 'true') : false);

      //get ranges of limitations, then group by PSC
      return Pollutant.findAll({
          where: {
            [Op.and]: Sequelize.literal("lower('" + id + "') IN (SELECT groups FROM regexp_split_to_table(lower(pollutant_groups), ';') AS groups)")
          }
        })
        .then(pollutants => {
          ViewLimitation.findAll({
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
              pollutantId: { [Op.in]: pollutants.map(a => a.id) }
            },
            order: ['pointSourceCategoryCode'],
            raw: true
          })
            .then(pointSourceCategories => {
              let pscPromises = [];

              pointSourceCategories.forEach(function(psc) {
                pscPromises.push(new Promise(function(resolve, reject) {
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
                      [Sequelize.literal("min(coalesce(case when lim_value ~ '^[0-9\\.\\,]+$' then regexp_replace(lim_value, ',', '', 'g')::numeric else null end, case when lim_value_min ~ '^[0-9\\.\\,]+$' then lim_value_min::numeric else null end))"), 'minimumLimitationValue'],
                      [Sequelize.literal("max(coalesce(case when lim_value ~ '^[0-9\\.\\,]+$' then regexp_replace(lim_value, ',', '', 'g')::numeric else null end, case when lim_value_max ~ '^[0-9\\.\\,]+$' then lim_value_max::numeric else null end))"), 'maximumLimitationValue'],
                      [Sequelize.literal("min(coalesce(case when lim_value ~ '^[0-9\\.\\,]+$' then null else lim_value end, case when lim_value_min ~ '^[0-9\\.\\,]+$' then null else lim_value_min end))"), 'minimumLimitationValueText'],
                      [Sequelize.literal("max(coalesce(case when lim_value ~ '^[0-9\\.\\,]+$' then null else lim_value end, case when lim_value_max ~ '^[0-9\\.\\,]+$' then null else lim_value_max end))"), 'maximumLimitationValueText']
                    ],
                    where: {
                      pollutantId: { [Op.in]: psc.pollutantId.split(',') },
                      pointSourceCategoryCode: { [Op.eq]: psc.pointSourceCategoryCode },
                      alternateLimitFlag: {
                        [Op.or]: [
                          { [Op.ne]: 'X by Factor' },
                          { [Op.eq]: null }
                        ]
                      }
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
                      buildRangeOfLimitations(limitValues)
                        .then(rangeOfLimitations => {
                          psc.rangeOfPollutantLimitations = rangeOfLimitations.rangeOfPollutantLimitations;
                          psc.rangeOfPollutantLimitationsForDownload = rangeOfLimitations.rangeOfPollutantLimitationsForDownload;
                          resolve(psc);
                        })
                        .catch(error => {
                          console.log(error);
                          psc.rangeOfPollutantLimitations = [];
                          psc.rangeOfPollutantLimitationsForDownload = '';
                          resolve(psc);
                        });
                    })
                    .catch((error) => {
                      console.log(error);
                      psc.rangeOfPollutantLimitations = rangeOfPollutantLimitationsAsTable;
                      psc.rangeOfPollutantLimitationsForDownload = rangeOfPollutantLimitationsForDownload.join('\n');
                      resolve(psc);
                    });
                }));
              });

              Promise.all(pscPromises)
                .then(pscs => {
                  if (downloadRequested) {
                    PollutantGroup.findOne({
                      where: {
                        id: { [Op.eq]: id }
                      }
                    })
                      .then(pollutantGroup => {
                        download.createDownloadFile('[pollutantsAndPointSourceCategories]',
                          'Pollutants and PSCs',
                          [
                            { key: 'pollutantDescription', label: 'Pollutant', width: 40 },
                            { key: 'pointSourceCategoryCode', label: '40 CFR' },
                            { key: 'pointSourceCategoryName', label: 'Point Source Category', width: 60 },
                            { key: 'pointSourceSubcategoriesForDownload', label: 'Subcategories', width: 40, wrapText: true },
                            { key: 'rangeOfPollutantLimitationsForDownload', label: 'Range of Pollutant Limitations', width: 220, wrapText: true }
                          ],
                          [
                            { label: 'Pollutant Category', value: pollutantGroup.description}
                          ],
                          pscs,
                          res);
                      });
                  }
                  else {
                    res.status(200).send(pscs);
                  }
                })
                .catch((error) => res.status(400).send("Error! " + utilities.sanitizeError(error)));
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
                { key: 'pointSourceCategoryCode', label: 'Point Source Category', width: 30 },
                { key: 'controlTechnologyCode', label: 'Level of Control' },
                { key: 'pollutantDescription', label: 'Pollutant', width: 40 },
                { key: 'comboSubcategory', label: 'Subpart', width: 60 },
                { key: 'wastestreamProcessTitle', label: 'Process Operation/Wastestream', width: 60 },
                { key: 'wastestreamProcessSecondary', label: 'Other Process/Wastestream Detail(s)', width: 60, wrapText: 'true' },
                { key: 'limitationDurationTypeDisplay', label: 'Type of Limitation', width: 30 },
                { key: 'limitationValue', label: 'Limitation Value' },
                { key: 'alternateLimitFlag', label: 'Limitation Flag' },
                { key: 'limitationUnitCode', label: 'Units', width: 90 },
                { key: 'limitationUnitBasis', label: 'Limitation Basis' }
              ],
              [
                { label: 'Pollutant', value: [...new Set(limitations.map(lim => lim.pollutantDescription))].join(', ') },
                { label: 'Point Source Categories', value: pointSourceCategoryCodes.join(', ')}
              ],
              limitations,
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
