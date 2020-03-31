const utilities = require('./utilities');

const ViewLimitation = require('../models').ViewLimitation;
const ViewLongTermAverage = require('../models').ViewLongTermAverage;
const TreatmentTechnologyCode = require('../models').TreatmentTechnologyCode;
const Op = require('sequelize').Op;
const Sequelize = require("sequelize");

let attributes = [
  'limitationId',
  'controlTechnologyCode',
  'controlTechnologyCfrSection',
  'comboSubcategory',
  'wastestreamProcessId',
  'wastestreamProcessTitle',
  'wastestreamProcessSecondary',
  'wastestreamProcessCfrSection',
  'wastestreamProcessLimitCalculationDescription',
  ['elg_pollutant_description', 'pollutantDescription'],
  'dischargeFrequency',
  'limitationValue',
  'minimumValue',
  'maximumValue',
  'zeroDischarge',
  'limitationDurationDescription',
  'limitationDurationBaseType',
  'limitationUnitCode',
  [Sequelize.literal("replace(unit_desc, '\\u00A7', U&'\\00A7')"), 'limitationUnitDescription'],
  'limitationUnitBasis',
  'alternateLimitFlag',
  'alternateLimitDescription',
  'limitRequirementDescription',
  'limitationLimitCalculationDescription',
  'limitationPollutantNotes',
  'longTermAverageCount'
];

let order = [
  'comboSubcategory',
  'controlTechnologyDisplayOrder',
  'wastestreamProcessDisplayOrder',
  'pollutantDescription',
  'limitationDurationDescription'
];

function wastestreamProcessLimitations(wastestreamProcessId) {
  return new Promise(function(resolve, reject) {
    ViewLimitation.findAll({
      attributes: attributes,
      where: {
        wastestreamProcessId: { [Op.eq]: wastestreamProcessId },
      },
      order: order
    })
      .then((limitations) => {
        let result = new Map();

        result.cfrSection = null;
        result.controlTechnologyCode = null;
        result.title = null;
        result.secondary = null;
        result.limitations = limitations;

        if (limitations.length > 0) {
          result.cfrSection = limitations[0].wastestreamProcessCfrSection;
          result.controlTechnologyCode = limitations[0].controlTechnologyCode;
          result.title = limitations[0].wastestreamProcessTitle;
          result.secondary = limitations[0].wastestreamProcessSecondary;
        }

        resolve(result);
      })
      .catch((error) => reject('Error retrieving limitations: ' + error));
  });
}

function pollutantLimitations(pollutantId, pointSourceCategoryCode) {
  return new Promise(function(resolve, reject) {
    ViewLimitation.findAll({
      attributes: attributes,
      where: {
        pollutantId: { [Op.eq]: pollutantId },
        pointSourceCategoryCode: { [Op.eq]: pointSourceCategoryCode }
      },
      order: order
    })
      .then((limitations) => {
        resolve(limitations);
      })
      .catch((error) => reject('Error retrieving limitations: ' + error));
  });
}

function fillLongTermAverage(longTermAverage) {
  return new Promise(function(resolve, reject) {
    TreatmentTechnologyCode.findAll({
      where: {
        [Op.and]: Sequelize.literal("code IN (SELECT codes FROM regexp_split_to_table('" + longTermAverage.treatmentTechnologyCodes + "', '; ') AS codes)")
      }
    })
      .then(treatmentTechnologyCodes => {
        let names = longTermAverage.treatmentTechnologyCodes.split("; ").map(code => treatmentTechnologyCodes.filter(treatmentTechnologyCode => treatmentTechnologyCode.id === code)[0].name).join(" + ");

        resolve({
          treatmentTechnologyNames: names,
          pollutantDescription: longTermAverage.pollutantDescription,
          longTermAverageValue: longTermAverage.longTermAverageValue,
          longTermAverageUnitCode: longTermAverage.longTermAverageUnitCode,
          longTermAverageUnitDescription: longTermAverage.longTermAverageUnitDescription,
          longTermAverageUnitBasis: longTermAverage.longTermAverageUnitBasis,
          longTermAverageNotes: longTermAverage.longTermAverageNotes,
          longTermAverageSourceTitle: longTermAverage.longTermAverageSourceTitle,
          alternateLimitFlag: longTermAverage.alternateLimitFlag,
          limitationValue: longTermAverage.limitationValue,
          limitationUnitCode: longTermAverage.limitationUnitCode,
          limitationUnitDescription: longTermAverage.limitationUnitDescription,
          limitationUnitBasis: longTermAverage.limitationUnitBasis
        });
      })
      .catch(err => {
        console.error("Failed to retrieve treatment technology names: " + err);
        resolve({
          treatmentTechnologyNames: longTermAverage.treatmentTechnologyCodes,
          pollutantDescription: longTermAverage.pollutantDescription,
          longTermAverageValue: longTermAverage.longTermAverageValue,
          longTermAverageUnitCode: longTermAverage.longTermAverageUnitCode,
          longTermAverageUnitDescription: longTermAverage.longTermAverageUnitDescription,
          longTermAverageUnitBasis: longTermAverage.longTermAverageUnitBasis,
          longTermAverageNotes: longTermAverage.longTermAverageNotes,
          longTermAverageSourceTitle: longTermAverage.longTermAverageSourceTitle,
          alternateLimitFlag: longTermAverage.alternateLimitFlag,
          limitationValue: longTermAverage.limitationValue,
          limitationUnitCode: longTermAverage.limitationUnitCode,
          limitationUnitDescription: longTermAverage.limitationUnitDescription,
          limitationUnitBasis: longTermAverage.limitationUnitBasis
        });
      });
  });
}

module.exports = {
  wastestreamProcessLimitations,
  pollutantLimitations,
  /**
   * @param {
   *          {id:number}
   * } req.params
   */
  read(req, res) {
    // check for required query attributes and replace with defaults if missing
    try {
      let id = utilities.parseIdAsInteger(req.params.id);

      if (id === null) {
        return res.status(400).send('Invalid value passed for id')
      }

      return ViewLimitation.findByPk(id, {
        attributes: [
          'elgPollutantDescription',
          'pointSourceCategoryCode',
          'pointSourceCategoryName',
          'comboSubcategory',
          'controlTechnologyCode',
          'controlTechnologyCfrSection',
          'wastestreamProcessTitle',
          'wastestreamProcessSecondary',
          'wastestreamProcessCfrSection',
        ]
      })
        .then((limitation) => {
          let result = new Map();
          result['pollutantDescription'] = limitation.elgPollutantDescription;
          result['pointSourceCategoryCode'] = limitation.pointSourceCategoryCode;
          result['pointSourceCategoryName'] = limitation.pointSourceCategoryName;
          result['comboSubcategory'] = limitation.comboSubcategory;
          result['controlTechnologyCode'] = limitation.controlTechnologyCode;
          result['controlTechnologyCfrSection'] = limitation.controlTechnologyCfrSection;
          result['wastestreamProcessTitle'] = limitation.wastestreamProcessTitle;
          result['wastestreamProcessSecondary'] = limitation.wastestreamProcessSecondary;
          result['wastestreamProcessCfrSection'] = limitation.wastestreamProcessCfrSection;
          result['longTermAverages'] = [];

          ViewLongTermAverage.findAll({
            attributes: [
              'treatmentTechnologyCodes',
              ['elg_pollutant_description', 'pollutantDescription'],
              'longTermAverageValue',
              'longTermAverageUnitCode',
              [Sequelize.literal("replace(lta_unit_desc, '\\u00A7', U&'\\00A7')"), 'longTermAverageUnitDescription'],
              'longTermAverageUnitBasis',
              'longTermAverageNotes',
              'longTermAverageSourceTitle',
              'alternateLimitFlag',
              'limitationValue',
              'limitationUnitCode',
              [Sequelize.literal("replace(unit_desc, '\\u00A7', U&'\\00A7')"), 'limitationUnitDescription'],
              'limitationUnitBasis'
            ],
            where: {
              limitationId: { [Op.eq]: id }
            },
            order: ['treatmentTechnologyCodes', 'pollutantDescription']
          })
            .then((longTermAverages) => {
              let ltaPromises = [];

              longTermAverages.forEach(function(lta) {
                ltaPromises.push(fillLongTermAverage(lta));
              });

              Promise.all(ltaPromises)
                .then(ltas => {
                  result['longTermAverages'] = ltas.sort(function(a, b) {
                    if (a.treatmentTechnologyNames < b.treatmentTechnologyNames) {
                      return -1;
                    }
                    if (a.treatmentTechnologyNames > b.treatmentTechnologyNames) {
                      return 1;
                    }
                    return 0;
                  });
                  res.status(200).send(result);
                });
            })
            .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
        })
        .catch((error) => res.status(400).send('Error! ' + utilities.sanitizeError(error)));
    } catch (err) {
      return res.status(400).send('Error !' + utilities.sanitizeError(err.toString()));
    }
  },
};
