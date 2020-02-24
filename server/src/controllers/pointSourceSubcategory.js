const PointSourceSubcategory = require('../models').PointSourceSubcategory;
const ControlTechnology = require('../models').ControlTechnology;
const ControlTechnologyNotes = require('../models').ControlTechnologyNotes;
const WastestreamProcess = require('../models').WastestreamProcess;
const WastestreamProcessTreatmentTechnology = require('../models').WastestreamProcessTreatmentTechnology;
const TreatmentTechnology = require('../models').TreatmentTechnology;
const WastestreamProcessTreatmentTechnologyPollutant = require('../models').WastestreamProcessTreatmentTechnologyPollutant;
const Pollutant  = require('../models').Pollutant ;
const Op = require('sequelize').Op;

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

function sanitizeError(error) {
  return DOMPurify.sanitize(error);
}

function fillControlTechnology(controlTechnology) {
  return new Promise( function(resolve, reject) {
    let ct = {
      'id': controlTechnology.id,
      'controlTechnologyCode': controlTechnology.controlTechnologyCode,
      'controlTechnologyDescription': controlTechnology.controlTechnologyDescription,
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
      WastestreamProcess.findAll({
        where: {
          controlTechnologyId: { [Op.eq]: controlTechnology.id }
        },
        order: ['displayOrder']
      }).then(wastestreamProcesses => {
        WastestreamProcessTreatmentTechnology.findAll({
          attributes: ['treatmentId'],
          where: {
            wastestreamProcessId: { [Op.in]: wastestreamProcesses.map(a => a.id) }
          }
        }).then(wastestreamProcessTreatmentTechnologies => {
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
                wastestreamProcesses.forEach((process) => {
                  process.zeroDischarge = (process.zeroDischarge !== '0');
                  process.includesBmps = (process.includesBmps !== '0');
                  process.noLimitations = (process.noLimitations !== '0');
                });

                ct['notes'] = controlTechnologyNotes;
                ct['technologyNames'] = treatmentTechnologies.map(a => a.codes).join('; ').split('; ').sort().filter(function (value, index, self) { return self.indexOf(value) === index; }).join('; ');
                ct['pollutants'] = pollutants.map(a => a.description).join('; ').split('; ').sort().filter(function (value, index, self) { return self.indexOf(value) === index; }).join('; ');
                ct['wastestreamProcesses'] = wastestreamProcesses;

                resolve(ct);
              });
            });
          })
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
        .catch((error) => res.status(400).send('Error! ' + sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + sanitizeError(err.toString()) + typeof req.query.keyword);
    }
  },
  /**
   * @param {
   *          {id:number},
   * } req.params
   */
  read(req, res) {
    // check for required query attributes and replace with defaults if missing
    let id = req.params.id ? req.params.id : 0;

    return PointSourceSubcategory.findAll({
      attributes: [
        'id',
        'pointSourceSubcategoryCode',
        'pointSourceSubcategoryTitle',
        'comboSubcategory'
      ],
      where: {
        id: { [Op.eq]: id }
      }})
      .then((pointSourceSubcategory) => {
        let result = new Map();

        result['id'] = pointSourceSubcategory[0].id;
        result['pointSourceSubcategoryCode'] = pointSourceSubcategory[0].pointSourceSubcategoryCode;
        result['pointSourceSubcategoryTitle'] = pointSourceSubcategory[0].pointSourceSubcategoryTitle;
        result['comboSubcategory'] = pointSourceSubcategory[0].comboSubcategory;
        result['controlTechnologies'] = [];

        ControlTechnology.findAll({
          attributes: ['id', 'controlTechnologyCode', 'controlTechnologyDescription', 'cfrSection', 'includesBmps'],
          where: {
            pointSourceSubcategoryId: { [Op.eq]: id },
            controlTechnologyCode: {[Op.in]: ['BPT', 'BCT', 'BAT', 'NSPS', 'PSES', 'PSNS']}
          },
          order: ['displayOrder'],
        })
          .then((controlTechnologies) => {

            let notesPromises = [];

            controlTechnologies.forEach(function(controlTechnology) {
              notesPromises.push(
                fillControlTechnology(controlTechnology)
              )
            });

            Promise.all(notesPromises).then((cts) => {
              result['controlTechnologies'] = cts;
              res.status(200).send(result)
            });
          })
          .catch((error) => res.status(400).send('Error! ' + sanitizeError(error)))
      })
      .catch((error) => res.status(400).send('Error! ' + sanitizeError(error)));
  }
};
