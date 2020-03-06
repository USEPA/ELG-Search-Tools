const utilities = require('./utilities');

const PointSourceSubcategory = require('../models').PointSourceSubcategory;
const ControlTechnology = require('../models').ControlTechnology;
const ControlTechnologyNotes = require('../models').ControlTechnologyNotes;
const WastestreamProcess = require('../models').WastestreamProcess;
const WastestreamProcessTreatmentTechnology = require('../models').WastestreamProcessTreatmentTechnology;
const TreatmentTechnology = require('../models').TreatmentTechnology;
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
      attributes: ['cfrSection', 'notes'],
      where: {
        controlTechnologyCode: { [Op.eq]: controlTechnology.controlTechnologyCode },
        cfrSection: { [Op.iLike]: controlTechnology.cfrSection + '%' }
      },
      order: ['cfrSection']
    }).then(controlTechnologyNotes => {
      ct['notes'] = []; //controlTechnologyNotes; TODO: update to only load this if/when the source database indicates to do so.

      WastestreamProcess.findAll({
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
              WastestreamProcessTreatmentTechnologyPollutant.findAll({
                attributes: ['pollutantId'],
                where: {
                  wastestreamProcessId: { [Op.in]: wastestreamProcesses.map(a => a.id) },
                  treatmentId: { [Op.in]: wastestreamProcessTreatmentTechnologies.map(a => a.treatmentId) }
                }
              }).then(wastestreamProcessTreatmentTechnologyPollutants => {
                Pollutant.findAll({
                  attributes: ['description'],
                  where: {
                    id: { [Op.in]: wastestreamProcessTreatmentTechnologyPollutants.map(a => a.pollutantId) }
                  }
                }).then(pollutants => {
                  ct['technologyNames'] = treatmentTechnologies.map(a => a.codes).join('; ').split('; ').sort().filter(function(value, index, self) {
                    return self.indexOf(value) === index;
                  }).join('; ');
                  ct['pollutants'] = pollutants.map(a => a.description).join('; ').split('; ').sort().filter(function(value, index, self) {
                    return self.indexOf(value) === index;
                  }).join('; ');

                  resolve(ct);
                });
              });
            })
          } else {
            // no treatment technologies are linked to this process
            // use limitations to get pollutants
            ViewLimitation.findAll( {
              attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('pollutant_code')), 'pollutantId'],
                [Sequelize.col('pollutant_desc'), 'pollutantDescription']
              ],
              where: {
                wastestreamProcessId: { [Op.in]: wastestreamProcesses.map(a => a.id) },
              }
            })
              .then(pollutants => {
                ct['pollutants'] = pollutants.map(a => a.pollutantDescription).join('; ').split('; ').sort().filter(function(value, index, self) {
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
    let id = isNaN(req.params.id) ? null : (Number.isInteger(Number(req.params.id)) ? Number(req.params.id) : null);

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

                ['BPT', 'BCT', 'BAT', 'NSPS', 'PSES', 'PSNS'].forEach(function(ctCode) {
                  console.log(ctCode);
                  if (cts.filter(function(ct){ return ct.controlTechnologyCode === ctCode }).length === 0) {
                    console.log(ctCode + ' missing');
                    ctPromises.push(
                      fillControlTechnology({id: null, controlTechnologyCode: ctCode, notes: null, includesBmps: '0'})
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
