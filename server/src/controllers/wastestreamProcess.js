const Limitation = require('../models').Limitation;
const Pollutant = require('../models').Pollutant;
const LimitationDuration = require('../models').LimitationDuration;
const LimitationUnit = require('../models').LimitationUnit;
const WastestreamProcess = require('../models').WastestreamProcess;
const ControlTechnology = require('../models').ControlTechnology;
const Op = require('sequelize').Op;

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

function sanitizeError(error) {
  return DOMPurify.sanitize(error);
}

function fillLimitation(limitation) {
  return new Promise( function(resolve, reject) {
    let lim = {
      'id': limitation.id,
      'pollutant': '',
      'duration': '',
      'dischargeFrequency': limitation.dischargeFrequency,
      'limitationValue': limitation.limitationValue,
      'units': '',
      'minimumValue': limitation.minimumValue,
      'maximumValue': limitation.maximumValue,
      'zeroDischarge': (limitation.includesBmps !== '0')
    };

    Pollutant.findAll({
      attributes: ['description'],
      where: {
        id: { [Op.eq]: limitation.pollutantId}
      }
    }).then(pollutants => {
      LimitationDuration.findAll({
        attributes: ['description'],
        where: {
          id: { [Op.eq]: limitation.limitationDurationId}
        }
      }).then(limitationDurations => {
        LimitationUnit.findAll({
          attributes: ['code'],
          where: {
            id: { [Op.eq]: limitation.limitationUnitId}
          }
        }).then(limitationUnits => {
          lim.pollutant = pollutants[0].description;
          lim.duration = limitationDurations[0].description;
          if (limitationUnits.length > 0) {
            lim.units = limitationUnits[0].code;
          }
          resolve(lim);
        });
      });
    });
  });
}

module.exports = {
  /**
   * @param {
   *          {id:number}
   * } req.params
   */
  read(req, res) {
    try {
      // check for required query attributes and replace with defaults if missing
      let id = req.params.id ? req.params.id : 0;

      return WastestreamProcess.findByPk(id)
        .then(wastestreamProcess => {
          ControlTechnology.findByPk(wastestreamProcess.controlTechnologyId)
            .then(controlTechnology => {

              Limitation.findAll({
                attributes: ['id', 'pollutantId', 'limitationDurationId', 'dischargeFrequency', 'limitationValue', 'limitationUnitId', 'minimumValue', 'maximumValue', 'zeroDischarge'],
                where: {
                  wastestreamProcessId: { [Op.eq]: wastestreamProcess.id },
                }
              })
                .then((limitations) => {
                  let limitationPromises = [];

                  limitations.forEach(function(limitation) {
                    limitationPromises.push(
                      fillLimitation(limitation)
                    )
                  });

                  Promise.all(limitationPromises).then((limits) => {
                    let result = new Map();
                    result.id = wastestreamProcess.id;
                    result.controlTechnologyId = wastestreamProcess.controlTechnologyId;
                    result.controlTechnologyCode = controlTechnology.controlTechnologyCode;
                    result.cfrSection = wastestreamProcess.cfrSection;
                    result.title = wastestreamProcess.title;
                    result.secondary = wastestreamProcess.secondary;
                    result.limitations = limits.sort((a,b) => (a.pollutant.toLowerCase() > b.pollutant.toLowerCase()) ? 1 : (a.pollutant.toLowerCase() === b.pollutant.toLowerCase()) ? ((a.duration.toLowerCase() > b.duration.toLowerCase()) ? 1 : -1) : -1);

                    res.status(200).send(result)
                  });
                })
                .catch((error) => res.status(400).send('Error! ' + sanitizeError(error)));
            })
            .catch((error) => res.status(400).send('Error! ' + sanitizeError(error)));
        })
        .catch((error) => res.status(400).send('Error! ' + sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + sanitizeError(err.toString()));
    }
  }
};
