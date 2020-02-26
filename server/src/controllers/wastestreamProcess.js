const utilities = require('./utilities');

const WastestreamProcess = require('../models').WastestreamProcess;
const ControlTechnology = require('../models').ControlTechnology;
const ViewLimitation = require('../models').ViewLimitation;
const Op = require('sequelize').Op;

function fillLimitation(limitation) {
  return new Promise( function(resolve, reject) {
    let lim = {
      'limitationId': limitation.limitationId,
      'pollutantDescription': limitation.pollutantDescription,
      'limitationDurationDescription': limitation.limitationDurationDescription,
      'dischargeFrequency': limitation.dischargeFrequency,
      'limitationValue': limitation.limitationValue,
      'limitationUnitCode': limitation.limitationUnitCode,
      'minimumValue': limitation.minimumValue,
      'maximumValue': limitation.maximumValue,
      'zeroDischarge': (limitation.includesBmps !== '0')
    };

    resolve(lim);
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
      let id = isNaN(req.params.id) ? null : (Number.isInteger(Number(req.params.id)) ? Number(req.params.id) : null);

      if (id === null) {
        return res.status(400).send('Invalid value passed for id')
      }

      return WastestreamProcess.findByPk(id)
        .then(wastestreamProcess => {
          let result = new Map();

          if(wastestreamProcess) {
            ControlTechnology.findByPk(wastestreamProcess.controlTechnologyId)
              .then(controlTechnology => {

                ViewLimitation.findAll({
                  attributes: ['limitationId', 'pollutantId', 'pollutantDescription', 'limitationDurationId', 'limitationDurationDescription', 'dischargeFrequency', 'limitationValue', 'limitationUnitId', 'minimumValue', 'maximumValue', 'zeroDischarge'],
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
                      result.limitations = limits.sort((a, b) => (a.pollutantDescription.toLowerCase() > b.pollutantDescription.toLowerCase()) ? 1 : (a.pollutantDescription.toLowerCase() === b.pollutantDescription.toLowerCase()) ? ((a.limitationDurationDescription.toLowerCase() > b.limitationDurationDescription.toLowerCase()) ? 1 : -1) : -1);

                      res.status(200).send(result)
                    });
                  })
                  .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
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
