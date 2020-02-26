const utilities = require('./utilities');

const ViewLimitation = require('../models').ViewLimitation;
const ControlTechnology = require('../models').ControlTechnology;
const Op = require('sequelize').Op;
const Sequelize = require("sequelize");

function fillControlTechnology(controlTechnology, limitationIds) {
  return new Promise( function(resolve, reject) {
    let ct = {
      'controlTechnologyCode': controlTechnology.controlTechnologyCode,
      'controlTechnologyDescription': utilities.getControlTechnologyDescription(controlTechnology.controlTechnologyCode),
      'limitations': []
    };

    ViewLimitation.findAll({
      attributes: [
        'wastestreamProcessTitle',
        'wastestreamProcessSecondary',
        [Sequelize.literal("case when zero_discharge = '0' then false else true end"), 'zeroDischarge'],
        'limitationDurationDescription',
        'dischargeFrequency',
        'limitationValue',
        'limitationUnitCode',
        'minimumValue'
      ],
      where: {
        limitationId: { [Op.in]: limitationIds },
        controlTechnologyCode: {[Op.eq]: ct.controlTechnologyCode}
      },
      order: ['wastestreamProcessTitle', 'wastestreamProcessSecondary'],
    })
      .then(limitations => {
        ct.limitations = limitations;

        resolve(ct);
      });
  })
}

module.exports = {
  list(req, res) {
    try {
      return ViewLimitation.findAll({
        attributes: [
          [Sequelize.fn('DISTINCT', Sequelize.col('pollutant_code')), 'pollutantId'],
          [Sequelize.col('pollutant_desc'), 'pollutantDescription']
        ],
        order: ['pollutant_desc']
      })
        .then(pollutants => {
          res.status(200).send(pollutants);
        })
        .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
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
        return res.status(400).send('Invalid value passed for id')
      }

      return ViewLimitation.findAll({
        group: [
          'pollutantId',
          'pollutantDescription',
          'pointSourceCategoryCode',
          'pointSourceCategoryName'
        ],
        attributes: [
          'pollutantId',
          'pollutantDescription',
          'pointSourceCategoryCode',
          'pointSourceCategoryName',
          [Sequelize.literal("string_agg(distinct combo_subcat, ', ' order by combo_subcat)"), 'pointSourceSubcategories'],
          [Sequelize.literal("string_agg(distinct processop_title, ', ' order by processop_title)"), 'wastestreamProcesses']
        ],
        where: {
          pollutantId: { [Op.eq]: id }
        }
      })
        .then(limitations => {
          res.status(200).send(limitations);
        })
        .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  },
  /**
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
        return res.status(400).send('Invalid value passed for pollutantId')
      }

      if (pointSourceCategoryCode === null) {
        return res.status(400).send('Invalid value passed for pointSourceCategoryCode')
      }

      let result = new Map();

      return ViewLimitation.findOne({
        group: [
          'pollutantId',
          'pollutantDescription',
          'pointSourceCategoryCode',
          'pointSourceCategoryName'
        ],
        attributes: [
          'pollutantId',
          'pollutantDescription',
          'pointSourceCategoryCode',
          'pointSourceCategoryName',
          [Sequelize.fn('string_agg', Sequelize.literal('distinct subcat_id::character varying'), ','), 'pointSourceSubcategoryIds'],
          [Sequelize.fn('string_agg', Sequelize.literal('distinct lim_id::character varying'), ','), 'limitationIds']
        ],
        where: {
          pollutantId: { [Op.eq]: pollutantId },
          pointSourceCategoryCode: { [Op.eq]: pointSourceCategoryCode }
        }
      })
        .then(pollutantPsc => {
          if (pollutantPsc) {
            result.pollutantId = pollutantPsc.pollutantId;
            result.pollutantDescription = pollutantPsc.pollutantDescription;
            result.pointSourceCategoryCode = pollutantPsc.pointSourceCategoryCode;
            result.pointSourceCategoryName = pollutantPsc.pointSourceCategoryName;

            ControlTechnology.findAll({
              group: ['controlTechnologyCode'],
              attributes: [
                'controlTechnologyCode',
                [Sequelize.fn('string_agg', Sequelize.literal('distinct ct_id::character varying'), ','), 'controlTechnologyIds']
              ],
              where: {
                pointSourceSubcategoryId: { [Op.in]: pollutantPsc.get('pointSourceSubcategoryIds').split(',') },
                controlTechnologyCode: { [Op.in]: ['BPT', 'BCT', 'BAT', 'NSPS', 'PSES', 'PSNS'] }
              },
              order: [[Sequelize.fn('min', Sequelize.literal('ct_order'))]]
            })
              .then(controlTechnologies => {
                let ctPromises = [];

                controlTechnologies.forEach(function(controlTechnology) {
                  ctPromises.push(
                    fillControlTechnology(controlTechnology, pollutantPsc.get('limitationIds').split(','))
                  )
                });

                Promise.all(ctPromises).then((cts) => {
                  result['controlTechnologies'] = cts.filter(function(value) {
                    return value.limitations.length > 0;
                  });
                  res.status(200).send(result)
                });
              })
              .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
          }
          else {
            res.status(200).send(result)
          }
        })
        .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  }
};
