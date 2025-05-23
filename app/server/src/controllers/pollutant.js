const utilities = require('./utilities');
const limitation = require('./limitation');

const ViewLimitation = require('../models').ViewLimitation;
const Pollutant = require('../models').Pollutant;
const PollutantGroup = require('../models').PollutantGroup;
const ViewLimitationRange = require('../models').ViewLimitationRange;
const Op = require('sequelize').Op;
const Sequelize = require('sequelize');

const download = require('./download');

/**
 *
 * @param {[]} limitValues
 * @param {} limitValues.minimumLimitationValue
 * @param {} limitValues.maximumLimitationValue
 * @param {string} limitValues.minimumLimitationValueText
 * @param {string} limitValues.maximumLimitationValueText
 * @param {string} limitValues.limitationUnitCode
 * @param {} limitValues.limitationUnitBasis
 * @param {string} limitValues.limitationDurationTypeDisplay
 * @param {string} limitValues.limitationDurationDescription
 * @param {string} limitValues.alternateLimitFlag
 * @param {string} limitValues.alternateLimitDescription
 * @returns {Promise<unknown>}
 */
function buildRangeOfLimitations(limitValues) {
  return new Promise(function(resolve) {
    let rangeOfPollutantLimitationsAsTable = [];
    let rangeOfPollutantLimitationsForDownload = [];

    limitValues
      .filter(function(limitValue) {
        return limitValue.minimumLimitationValue !== null || limitValue.maximumLimitationValue !== null;
      })
      .forEach(function(limitValue) {
        let rangeAsTableRow = new Map();
        rangeAsTableRow.minimumLimitationValue = limitValue.minimumLimitationValue
          ? limitValue.minimumLimitationValue
          : limitValue.minimumLimitationValueText;
        rangeAsTableRow.maximumLimitationValue = limitValue.maximumLimitationValue
          ? limitValue.maximumLimitationValue
          : limitValue.maximumLimitationValueText;
        rangeAsTableRow.limitationUnitCode = limitValue.limitationUnitCode
          ? limitValue.limitationUnitCode.trim()
          : null;
        let limitationUnitBasisDisplay =
          limitValue.limitationUnitBasis === null ? '' : ' (' + limitValue.limitationUnitBasis + ')';
        rangeAsTableRow.limitationType = limitValue.limitationDurationTypeDisplay + limitationUnitBasisDisplay;
        rangeAsTableRow.limitationDurationDescription = limitValue.limitationDurationDescription;
        rangeAsTableRow.alternateLimitFlag = limitValue.alternateLimitFlag;
        rangeAsTableRow.alternateLimitDescription = limitValue.alternateLimitDescription;
        rangeOfPollutantLimitationsAsTable.push(rangeAsTableRow);

        let alternateLimitFlagForDownload = rangeAsTableRow.alternateLimitFlag
          ? rangeAsTableRow.alternateLimitFlag
          : '';
        rangeOfPollutantLimitationsForDownload.push(
          alternateLimitFlagForDownload +
            rangeAsTableRow.minimumLimitationValue +
            ' (' +
            rangeAsTableRow.limitationUnitCode +
            ') - ' +
            alternateLimitFlagForDownload +
            rangeAsTableRow.maximumLimitationValue +
            ' (' +
            rangeAsTableRow.limitationUnitCode +
            ') ' +
            rangeAsTableRow.limitationType
        );
      });

    resolve({
      rangeOfPollutantLimitations: rangeOfPollutantLimitationsAsTable,
      rangeOfPollutantLimitationsForDownload: rangeOfPollutantLimitationsForDownload.join('\n'),
    });
  });
}

function getPollutantLimitationRanges(id) {
  return new Promise((resolve, reject) => {
    ViewLimitationRange.findAll({
      attributes: [
        'limitationDurationTypeDisplay',
        'alternateLimitFlag',
        'limitationDisplayUnits',
        [
          Sequelize.literal(
            "min(coalesce(case when display_value ~ '^[0-9\\.\\,]+$' then regexp_replace(display_value, ',', '', 'g')::numeric else null end, case when display_min ~ '^[0-9\\.\\,]+$' then display_min::numeric else null end))"
          ),
          'minimumDisplayValue',
        ],
        [
          Sequelize.literal(
            "max(coalesce(case when display_value ~ '^[0-9\\.\\,]+$' then regexp_replace(display_value, ',', '', 'g')::numeric else null end, case when display_max ~ '^[0-9\\.\\,]+$' then display_max::numeric else null end))"
          ),
          'maximumDisplayValue',
        ],
      ],
      group: ['limitationDurationTypeDisplay', 'alternateLimitFlag', 'limitationDisplayUnits'],
      where: {
        pollutantDescription: { [Op.in]: id },
      },
      order: ['limitationDurationTypeDisplay', 'alternateLimitFlag', 'limitationDisplayUnits'],
      raw: true,
    })
      .then((limitationRanges) => {
        let ranges = limitationRanges.map(function(lr) {
          let alternateLimitFlagDisplay = lr.alternateLimitFlag ? lr.alternateLimitFlag : '';
          let minimumDisplayValue = lr.minimumDisplayValue ? lr.minimumDisplayValue : '';
          let maximumDisplayValue = lr.maximumDisplayValue ? lr.maximumDisplayValue : '';
          let limitationDisplayUnits = lr.limitationDisplayUnits === 'N/A' ? '' : ' ' + lr.limitationDisplayUnits;
          return (
            lr.limitationDurationTypeDisplay +
            ': ' +
            alternateLimitFlagDisplay +
            minimumDisplayValue +
            ' to ' +
            alternateLimitFlagDisplay +
            maximumDisplayValue +
            limitationDisplayUnits
          );
        });

        resolve(ranges);
      })
      .catch((error) => reject('Error getting pollutant limitation ranges: ' + error));
  });
}

module.exports = {
  list(req, res) {
    try {
      return ViewLimitation.findAll({
        attributes: [
          [Sequelize.fn('DISTINCT', Sequelize.col('pollutant_code')), 'pollutantId'],
          [Sequelize.col('pollutant_desc'), 'pollutantDescription'],
        ],
        order: ['pollutant_desc'],
      })
        .then((pollutants) => {
          Pollutant.findAll({
            attributes: [
              ['elg_pollutant_description', 'pollutantDescription'],
              [Sequelize.literal("string_agg(distinct pollutant_desc, '|' order by pollutant_desc)"), 'pollutantId'],
            ],
            where: {
              id: { [Op.in]: pollutants.map((a) => a.pollutantId) },
            },
            group: ['elg_pollutant_description'],
          })
            .then((polls) => {
              res.status(200).send(polls);
            })
            .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
        })
        .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  },
  listCategories(req, res) {
    try {
      return ViewLimitation.findAll({
        attributes: [
          [Sequelize.fn('DISTINCT', Sequelize.col('pollutant_code')), 'pollutantId'],
          [Sequelize.col('pollutant_desc'), 'pollutantDescription'],
        ],
        order: ['pollutant_desc'],
      })
        .then((pollutants) => {
          Pollutant.findOne({
            attributes: [[Sequelize.literal("string_agg(distinct pollutant_groups::text, ';')"), 'pollutantGroups']],
            where: {
              id: { [Op.in]: pollutants.map((a) => a.pollutantId) },
              pollutantGroups: { [Op.ne]: null },
            },
            raw: true,
          })
            .then((polls) => {
              PollutantGroup.findAll({
                where: {
                  id: { [Op.in]: polls.pollutantGroups.split(';') },
                },
                order: ['description'],
              })
                .then((pollutantGroups) => {
                  res.status(200).send(pollutantGroups);
                })
                .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
            })
            .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
        })
        .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
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
        return res.status(400).send('Invalid value passed for id');
      }

      Pollutant.findAll({
        where: {
          description: { [Op.in]: id },
        },
      })
        .then((polls) => {
          if (polls.length === 0) {
            res.status(404).send();
          } else {
            let downloadRequested = utilities.parseDownload(req.query.download);

            //get ranges of limitations, then group by PSC
            return ViewLimitation.findAll({
              group: [
                ['elg_pollutant_description', 'pollutantDescription'],
                'pointSourceCategoryCode',
                'pointSourceCategoryName',
                'pointSourceCategoryLinkUrl',
              ],
              attributes: [
                [Sequelize.literal("string_agg(distinct pollutant_code::text, ',')"), 'pollutantId'],
                ['elg_pollutant_description', 'pollutantDescription'],
                'pointSourceCategoryCode',
                'pointSourceCategoryName',
                'pointSourceCategoryLinkUrl',
                [
                  Sequelize.literal("string_agg(distinct combo_subcat, '<br/>' order by combo_subcat)"),
                  'pointSourceSubcategories',
                ],
                [
                  Sequelize.literal("string_agg(distinct combo_subcat, '\n' order by combo_subcat)"),
                  'pointSourceSubcategoriesForDownload',
                ],
              ],
              where: {
                pollutantDescription: { [Op.in]: id },
              },
              order: ['pointSourceCategoryCode'],
              raw: true,
            })
              .then((pointSourceCategories) => {
                let pscPromises = [];

                pointSourceCategories.forEach(function(psc) {
                  pscPromises.push(
                    new Promise(function(resolve) {
                      psc.rangeOfPollutantLimitations = [];
                      psc.rangeOfPollutantLimitationsForDownload = '';

                      ViewLimitation.findAll({
                        group: [
                          'limitationDurationTypeDisplay',
                          'limitationUnitBasis',
                          'limitationUnitCode',
                          'limitationDurationDescription',
                          'alternateLimitFlag',
                          'alternateLimitDescription',
                        ],
                        attributes: [
                          'limitationDurationTypeDisplay',
                          'limitationUnitBasis',
                          'limitationUnitCode',
                          'limitationDurationDescription',
                          'alternateLimitFlag',
                          'alternateLimitDescription',
                          [
                            Sequelize.literal(
                              "min(coalesce(case when lim_value ~ '^[0-9\\.\\,]+$' then regexp_replace(lim_value, ',', '', 'g')::numeric else null end, case when lim_value_min ~ '^[0-9\\.\\,]+$' then lim_value_min::numeric else null end))"
                            ),
                            'minimumLimitationValue',
                          ],
                          [
                            Sequelize.literal(
                              "max(coalesce(case when lim_value ~ '^[0-9\\.\\,]+$' then regexp_replace(lim_value, ',', '', 'g')::numeric else null end, case when lim_value_max ~ '^[0-9\\.\\,]+$' then lim_value_max::numeric else null end))"
                            ),
                            'maximumLimitationValue',
                          ],
                          [
                            Sequelize.literal(
                              "min(coalesce(case when lim_value ~ '^[0-9\\.\\,]+$' then null else lim_value end, case when lim_value_min ~ '^[0-9\\.\\,]+$' then null else lim_value_min end))"
                            ),
                            'minimumLimitationValueText',
                          ],
                          [
                            Sequelize.literal(
                              "max(coalesce(case when lim_value ~ '^[0-9\\.\\,]+$' then null else lim_value end, case when lim_value_max ~ '^[0-9\\.\\,]+$' then null else lim_value_max end))"
                            ),
                            'maximumLimitationValueText',
                          ],
                        ],
                        where: {
                          pollutantDescription: { [Op.in]: id },
                          pointSourceCategoryCode: { [Op.eq]: psc.pointSourceCategoryCode },
                          alternateLimitFlag: {
                            [Op.or]: [{ [Op.ne]: 'X by Factor' }, { [Op.eq]: null }],
                          },
                        },
                        order: [
                          'limitationDurationTypeDisplay',
                          'limitationUnitBasis',
                          'limitationUnitCode',
                          'limitationDurationDescription',
                          'alternateLimitFlag',
                          'alternateLimitDescription',
                        ],
                        raw: true,
                      })
                        .then((limitValues) => {
                          buildRangeOfLimitations(limitValues)
                            .then(
                              /**
                               *
                               * @param {Object} rangeOfLimitations
                               * @param {Object[]} rangeOfLimitations.rangeOfPollutantLimitations
                               * @param {string} rangeOfLimitations.rangeOfPollutantLimitationsForDownload
                               */
                              (rangeOfLimitations) => {
                                psc.rangeOfPollutantLimitations = rangeOfLimitations.rangeOfPollutantLimitations;
                                psc.rangeOfPollutantLimitationsForDownload =
                                  rangeOfLimitations.rangeOfPollutantLimitationsForDownload;
                                resolve(psc);
                              }
                            )
                            .catch((error) => {
                              console.log(error);
                              resolve(psc);
                            });
                        })
                        .catch((error) => {
                          console.log(error);
                          resolve(psc);
                        });
                    })
                  );
                });

                Promise.all(pscPromises)
                  .then((pscs) => {
                    if (downloadRequested) {
                      Pollutant.findOne({
                        group: ['elgDescription'],
                        attributes: ['elgDescription'],
                        where: {
                          description: { [Op.in]: id },
                        },
                      }).then((pollutant) => {
                        download.createDownloadFile(
                          '[pointSourceCategories]',
                          'Point Source Categories',
                          [
                            { key: 'pointSourceCategoryCode', label: '40 CFR' },
                            { key: 'pointSourceCategoryName', label: 'Point Source Category', width: 60 },
                            {
                              key: 'pointSourceSubcategoriesForDownload',
                              label: 'Subcategories',
                              width: 40,
                              wrapText: true,
                            },
                            {
                              key: 'rangeOfPollutantLimitationsForDownload',
                              label: 'Range of Pollutant Limitations',
                              width: 220,
                              wrapText: true,
                            },
                          ],
                          [
                            { label: 'Pollutant', value: pollutant ? pollutant.elgDescription : '' },
                            { label: 'Number of PSCs Referencing Pollutant', value: pscs.length },
                          ],
                          pscs,
                          res
                        );
                      });
                    } else {
                      getPollutantLimitationRanges(id)
                        .then((ranges) => {
                          res.status(200).send({ ranges: ranges, pscs: pscs });
                        })
                        .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
                    }
                  })
                  .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
              })
              .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
          }
        })
        .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  },
  /**
   * @param {
   *          {id:number},
   *          {download:string}
   * } req.query
   */
  readCategory(req, res) {
    // check for required query attributes and replace with defaults if missing
    try {
      let id = req.query.id ? req.query.id : '';

      if (id === '' || isNaN(id)) {
        return res.status(400).send('Invalid value passed for id');
      }

      let downloadRequested = utilities.parseDownload(req.query.download);

      //get ranges of limitations, then group by PSC
      return Pollutant.sequelize
        .query(
          'SELECT pollutant_code as "id" ' +
            ' FROM elg_search."Pollutant" ' +
            " WHERE lower(?) IN (SELECT groups FROM regexp_split_to_table(lower(pollutant_groups), ';') AS groups)",
          {
            replacements: [id],
            type: Sequelize.QueryTypes.SELECT,
          }
        )
        .then((pollutants) => {
          ViewLimitation.findAll({
            group: [
              ['elg_pollutant_description', 'pollutantDescription'],
              'pointSourceCategoryCode',
              'pointSourceCategoryName',
              'pointSourceCategoryLinkUrl',
            ],
            attributes: [
              [Sequelize.literal("string_agg(distinct pollutant_code::text, ',')"), 'pollutantId'],
              ['elg_pollutant_description', 'pollutantDescription'],
              'pointSourceCategoryCode',
              'pointSourceCategoryName',
              'pointSourceCategoryLinkUrl',
              [
                Sequelize.literal("string_agg(distinct combo_subcat, '<br/>' order by combo_subcat)"),
                'pointSourceSubcategories',
              ],
              [
                Sequelize.literal("string_agg(distinct combo_subcat, '\n' order by combo_subcat)"),
                'pointSourceSubcategoriesForDownload',
              ],
            ],
            where: {
              pollutantId: { [Op.in]: pollutants.map((a) => a.id) },
            },
            order: ['pointSourceCategoryCode'],
            raw: true,
          })
            .then((pointSourceCategories) => {
              let pscPromises = [];

              pointSourceCategories.forEach(function(psc) {
                pscPromises.push(
                  new Promise(function(resolve) {
                    psc.rangeOfPollutantLimitations = [];
                    psc.rangeOfPollutantLimitationsForDownload = '';

                    ViewLimitation.findAll({
                      group: [
                        'limitationDurationTypeDisplay',
                        'limitationUnitBasis',
                        'limitationUnitCode',
                        'limitationDurationDescription',
                        'alternateLimitFlag',
                        'alternateLimitDescription',
                      ],
                      attributes: [
                        'limitationDurationTypeDisplay',
                        'limitationUnitBasis',
                        'limitationUnitCode',
                        'limitationDurationDescription',
                        'alternateLimitFlag',
                        'alternateLimitDescription',
                        [
                          Sequelize.literal(
                            "min(coalesce(case when lim_value ~ '^[0-9\\.\\,]+$' then regexp_replace(lim_value, ',', '', 'g')::numeric else null end, case when lim_value_min ~ '^[0-9\\.\\,]+$' then lim_value_min::numeric else null end))"
                          ),
                          'minimumLimitationValue',
                        ],
                        [
                          Sequelize.literal(
                            "max(coalesce(case when lim_value ~ '^[0-9\\.\\,]+$' then regexp_replace(lim_value, ',', '', 'g')::numeric else null end, case when lim_value_max ~ '^[0-9\\.\\,]+$' then lim_value_max::numeric else null end))"
                          ),
                          'maximumLimitationValue',
                        ],
                        [
                          Sequelize.literal(
                            "min(coalesce(case when lim_value ~ '^[0-9\\.\\,]+$' then null else lim_value end, case when lim_value_min ~ '^[0-9\\.\\,]+$' then null else lim_value_min end))"
                          ),
                          'minimumLimitationValueText',
                        ],
                        [
                          Sequelize.literal(
                            "max(coalesce(case when lim_value ~ '^[0-9\\.\\,]+$' then null else lim_value end, case when lim_value_max ~ '^[0-9\\.\\,]+$' then null else lim_value_max end))"
                          ),
                          'maximumLimitationValueText',
                        ],
                      ],
                      where: {
                        pollutantId: { [Op.in]: psc.pollutantId.split(',') },
                        pointSourceCategoryCode: { [Op.eq]: psc.pointSourceCategoryCode },
                        alternateLimitFlag: {
                          [Op.or]: [{ [Op.ne]: 'X by Factor' }, { [Op.eq]: null }],
                        },
                      },
                      order: [
                        'limitationDurationTypeDisplay',
                        'limitationUnitBasis',
                        'limitationUnitCode',
                        'limitationDurationDescription',
                        'alternateLimitFlag',
                        'alternateLimitDescription',
                      ],
                      raw: true,
                    })
                      .then((limitValues) => {
                        buildRangeOfLimitations(limitValues)
                          .then(
                            /**
                             *
                             * @param {Object} rangeOfLimitations
                             * @param {Object[]} rangeOfLimitations.rangeOfPollutantLimitations
                             * @param {string} rangeOfLimitations.rangeOfPollutantLimitationsForDownload
                             */
                            (rangeOfLimitations) => {
                              psc.rangeOfPollutantLimitations = rangeOfLimitations.rangeOfPollutantLimitations;
                              psc.rangeOfPollutantLimitationsForDownload =
                                rangeOfLimitations.rangeOfPollutantLimitationsForDownload;
                              resolve(psc);
                            }
                          )
                          .catch((error) => {
                            console.log(error);
                            resolve(psc);
                          });
                      })
                      .catch((error) => {
                        console.log(error);
                        resolve(psc);
                      });
                  })
                );
              });

              Promise.all(pscPromises)
                .then((pscs) => {
                  if (downloadRequested) {
                    PollutantGroup.findOne({
                      where: {
                        id: { [Op.eq]: id },
                      },
                    }).then((pollutantGroup) => {
                      download.createDownloadFile(
                        '[pollutantsAndPointSourceCategories]',
                        'Pollutants and PSCs',
                        [
                          { key: 'pollutantDescription', label: 'Pollutant', width: 40 },
                          { key: 'pointSourceCategoryCode', label: '40 CFR' },
                          { key: 'pointSourceCategoryName', label: 'Point Source Category', width: 60 },
                          {
                            key: 'pointSourceSubcategoriesForDownload',
                            label: 'Subcategories',
                            width: 40,
                            wrapText: true,
                          },
                          {
                            key: 'rangeOfPollutantLimitationsForDownload',
                            label: 'Range of Pollutant Limitations',
                            width: 220,
                            wrapText: true,
                          },
                        ],
                        [{ label: 'Pollutant Category', value: pollutantGroup ? pollutantGroup.description : '' }],
                        pscs,
                        res
                      );
                    });
                  } else {
                    res.status(200).send({ ranges: [], pscs: pscs });
                  }
                })
                .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
            })
            .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
        })
        .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
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
      let pollutantIds = req.query.pollutantId ? req.query.pollutantId.split(',') : [];
      let pointSourceCategoryCodes = req.query.pointSourceCategoryCode
        ? req.query.pointSourceCategoryCode.split(',')
        : [];

      //validate passed in values
      if (
        pollutantIds === [] ||
        pollutantIds.some(function(pollutantId) {
          return utilities.parseIdAsInteger(pollutantId) === null;
        })
      ) {
        return res.status(400).send('Invalid value passed for pollutantId');
      }

      if (
        pointSourceCategoryCodes === [] ||
        pointSourceCategoryCodes.some(function(psc) {
          return utilities.parseIdAsInteger(psc) === null;
        })
      ) {
        return res.status(400).send('Invalid value passed for pointSourceCategoryCode');
      }

      if (req.query.download && !['true', 'false'].includes(req.query.download)) {
        return res.status(400).send('Invalid value passed for download');
      }

      let downloadRequested = utilities.parseDownload(req.query.download);

      limitation
        .pollutantLimitations(pollutantIds, pointSourceCategoryCodes)
        .then((limitations) => {
          if (downloadRequested) {
            download.createDownloadFile(
              'limitations',
              'Pollutant Limitations',
              [
                { key: 'pointSourceCategoryCode', label: 'Point Source Category', width: 30 },
                { key: 'controlTechnologyCode', label: 'Level of Control' },
                { key: 'pollutantDescription', label: 'Pollutant', width: 40 },
                { key: 'comboSubcategory', label: 'Subpart', width: 60 },
                { key: 'wastestreamProcessTitle', label: 'Process Operation/Wastestream', width: 60 },
                {
                  key: 'wastestreamProcessSecondary',
                  label: 'Other Process/Wastestream Detail(s)',
                  width: 60,
                  wrapText: 'true',
                },
                { key: 'limitationDurationTypeDisplay', label: 'Type of Limitation', width: 30 },
                {
                  key: 'limitationValue',
                  label: 'Limitation Value',
                  formatter: (row) =>
                    row.limitationValue ?? `${row.minimumValue}${row.maximumValue ? ' - ' + row.maximumValue : ''}`,
                },
                { key: 'alternateLimitFlag', label: 'Limitation Flag' },
                { key: 'limitationUnitCode', label: 'Units', width: 90 },
                { key: 'limitationUnitBasis', label: 'Limitation Basis' },
              ],
              [
                {
                  label: 'Pollutant',
                  value: [...new Set(limitations.map((lim) => lim.pollutantDescription))].join(', '),
                },
                { label: 'Point Source Categories', value: pointSourceCategoryCodes.join(', ') },
              ],
              limitations,
              res
            );
          } else {
            res.status(200).send(limitations);
          }
        })
        .catch((error) => res.status(400).send(utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  },
};
