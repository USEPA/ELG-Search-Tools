const utilities = require('./utilities');

const PointSourceSubcategory = require('../models').PointSourceSubcategory;
const ControlTechnology = require('../models').ControlTechnology;
const ControlTechnologyNotes = require('../models').ControlTechnologyNotes;
const WastestreamProcess = require('../models').WastestreamProcess;
const WastestreamProcessTreatmentTechnology = require('../models').WastestreamProcessTreatmentTechnology;
const TreatmentTechnology = require('../models').TreatmentTechnology;
const TreatmentTechnologyCode = require('../models').TreatmentTechnologyCode;
const WastestreamProcessTreatmentTechnologyPollutant = require('../models').WastestreamProcessTreatmentTechnologyPollutant;
const Pollutant  = require('../models').Pollutant;
const ViewLimitation  = require('../models').ViewLimitation;
const Op = require('sequelize').Op;
const Sequelize = require("sequelize");

function fillControlTechnology(controlTechnology) {
  return new Promise( function(resolve, reject) {
    let ct = {
      'id': controlTechnology.id,
      'controlTechnologyCode': controlTechnology.controlTechnologyCode,
      'controlTechnologyDescription': utilities.getControlTechnologyDescription(controlTechnology.controlTechnologyCode),
      'atAGlance': controlTechnology.notes,
      'notes': [],
      'technologyNames': '',
      'pollutants': '',
      'includesBmp': (controlTechnology.includesBmps !== '0'),
      'wastestreamProcesses': []
    };

    ControlTechnologyNotes.findAll({
      attributes: [
        'cfrSection',
        [Sequelize.literal("replace(replace(ct_notes, '\\u00A7', U&'\\00A7'), '\\u00B5', U&'\\00B5')"), 'notes']
      ],
      where: {
        controlTechnologyCode: { [Op.eq]: controlTechnology.controlTechnologyCode },
        cfrSection: { [Op.iLike]: controlTechnology.cfrSection + '%' },
        display: { [Op.eq] : true },
        [Op.and]: [
          Sequelize.literal("split_part(ct_cfr_section, '.', 1) = split_part('" + controlTechnology.cfrSection + "', '.', 1)"),
          Sequelize.literal("split_part(ct_cfr_section, '.', 2) = split_part('" + controlTechnology.cfrSection + "', '.', 2)")
        ]
      },
      order: ['cfrSection']
    }).then(controlTechnologyNotes => {
      ct['notes'] = controlTechnologyNotes;

      WastestreamProcess.findAll({
        attributes: [
          'id',
          'controlTechnologyId',
          'cfrSection',
          'title',
          'secondary',
          [Sequelize.literal("replace(processop_description, '\\u00A7', U&'\\00A7')"), 'description'],
          [Sequelize.literal("replace(processop_notes, '\\u00A7', U&'\\00A7')"), 'notes'],
          [Sequelize.literal("replace(lim_calc_desc, '\\u00A7', U&'\\00A7')"), 'limitCalculationDescription'],
          'sourceId',
          'zeroDischarge',
          'includesBmps',
          'noLimitations',
          'alternativeRequirement',
          'voluntaryRequirement',
          'additionalDetail',
          [Sequelize.literal("split_part(cfr_sect, '.', 1) || '_1' || split_part(cfr_sect, '.', 2)"), 'cfrSectionAnchor']
        ],
        where: {
          controlTechnologyId: { [Op.eq]: controlTechnology.id }
        },
        order: ['displayOrder']
      }).then(wastestreamProcesses => {
        ct['wastestreamProcesses'] = wastestreamProcesses;

        WastestreamProcessTreatmentTechnology.findAll({
          attributes: ['treatmentId'],
          where: {
            wastestreamProcessId: { [Op.in]: wastestreamProcesses.map(a => a.id) }
          }
        }).then(wastestreamProcessTreatmentTechnologies => {
          if (wastestreamProcessTreatmentTechnologies.length > 0) {
            TreatmentTechnology.findAll({
              attributes: ['codes'],
              where: {
                id: { [Op.in]: wastestreamProcessTreatmentTechnologies.map(a => a.treatmentId) }
              }
            }).then(treatmentTechnologies => {
              TreatmentTechnologyCode.findAll({
                attributes: ['name'],
                where: {
                  code: { [Op.in]: treatmentTechnologies.map(a => a.codes).join('; ').split('; ') }
                },
                group: ['name'],
                order: ['name']
              })
                .then((treatmentTechnologyCodes) => {
                  WastestreamProcessTreatmentTechnologyPollutant.findAll({
                    attributes: ['pollutantId'],
                    where: {
                      wastestreamProcessId: { [Op.in]: wastestreamProcesses.map(a => a.id) },
                      treatmentId: { [Op.in]: wastestreamProcessTreatmentTechnologies.map(a => a.treatmentId) }
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
                      ct['technologyNames'] = treatmentTechnologyCodes.map(a => a.name).join('; ');
                      ct['pollutants'] = pollutants.map(a => a.elgDescription).join('; ');

                      resolve(ct);
                    });
                  });
                });
            })
          } else {
            // no treatment technologies are linked to this process
            // use limitations to get pollutants
            ViewLimitation.findAll( {
              attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('pollutant_code')), 'pollutantId'],
                [Sequelize.col('elg_pollutant_description'), 'elgPollutantDescription']
              ],
              where: {
                wastestreamProcessId: { [Op.in]: wastestreamProcesses.map(a => a.id) },
              }
            })
              .then(pollutants => {
                ct['pollutants'] = pollutants.map(a => a.elgPollutantDescription).join('; ').split('; ').sort().filter(function(value, index, self) {
                  return self.indexOf(value) === index;
                }).join('; ');

                resolve(ct);
              })
          }
        });
      });
    })
  })
}

module.exports = {
  /**
   * @param {
   *          {pointSourceCategoryCode:number}
   * } req.query
   */
  list(req, res) {
    // check for required query attributes and replace with defaults if missing
    try {
      let pointSourceCategoryCode = req.query.pointSourceCategoryCode ? req.query.pointSourceCategoryCode : 0;

      return PointSourceSubcategory.findAll({
        attributes: [
          'id',
          'pointSourceSubcategoryCode',
          'pointSourceSubcategoryTitle',
          'comboSubcategory'
        ],
        where: {
          pointSourceCategoryCode: { [Op.eq]: pointSourceCategoryCode },
        },
        order: ['pointSourceSubcategoryCode'],
      })
        .then((pointSourceSubcategories) => {
          res.status(200).send(pointSourceSubcategories);
        })
        .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  },
  /**
   * @param {
   *          {id:number},
   * } req.params
   */
  read(req, res) {
    // check for required query attributes and replace with defaults if missing
    let id = utilities.parseIdAsInteger(req.params.id);

    if (id === null) {
      return res.status(400).send('Invalid value passed for id')
    }

    return PointSourceSubcategory.findByPk(id, {
      attributes: [
        'id',
        'pointSourceSubcategoryCode',
        'pointSourceSubcategoryTitle',
        'comboSubcategory'
      ]
    })
      .then((pointSourceSubcategory) => {
        let result = new Map();

        if(pointSourceSubcategory) {
          result['id'] = pointSourceSubcategory.id;
          result['pointSourceSubcategoryCode'] = pointSourceSubcategory.pointSourceSubcategoryCode;
          result['pointSourceSubcategoryTitle'] = pointSourceSubcategory.pointSourceSubcategoryTitle;
          result['comboSubcategory'] = pointSourceSubcategory.comboSubcategory;
          result['controlTechnologies'] = [];

          ControlTechnology.findAll({
            attributes: ['id', 'controlTechnologyCode', 'cfrSection', 'includesBmps', 'notes'],
            where: {
              pointSourceSubcategoryId: { [Op.eq]: id },
              controlTechnologyCode: { [Op.in]: ['BPT', 'BCT', 'BAT', 'NSPS', 'PSES', 'PSNS'] }
            },
            order: ['displayOrder'],
          })
            .then((controlTechnologies) => {
              let ctPromises = [];

              controlTechnologies.forEach(function(controlTechnology) {
                ctPromises.push(
                  fillControlTechnology(controlTechnology)
                )
              });

              Promise.all(ctPromises).then((cts) => {
                result['controlTechnologies'] = cts;

                //add record for each LOC that is not relevant for this subcategory
                ctPromises = [];

                ['BPT', 'BAT', 'BCT', 'NSPS', 'PSES', 'PSNS'].forEach(function(ctCode, index ) {
                  if (cts.filter(function(ct){ return ct.controlTechnologyCode === ctCode }).length === 0) {
                    ctPromises.push(
                      fillControlTechnology({id: (index * -1), controlTechnologyCode: ctCode, notes: null, includesBmps: '0'})
                    );
                  }
                });

                Promise.all(ctPromises).then((cts) => {
                  result['controlTechnologies'] = result['controlTechnologies'].concat(cts);
                  res.status(200).send(result);
                });
              });
            })
            .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
        }
        else {
          res.status(200).send(result);
        }
      })
      .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
  }
};
