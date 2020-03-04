const ViewLimitation = require('../models').ViewLimitation;
const Op = require('sequelize').Op;

let attributes = [
  'limitationId',
  'controlTechnologyCode',
  'controlTechnologyCfrSection',
  'comboSubcategory',
  'wastestreamProcessTitle',
  'wastestreamProcessSecondary',
  'wastestreamProcessCfrSection',
  'pollutantDescription',
  'dischargeFrequency',
  'limitationValue',
  'minimumValue',
  'maximumValue',
  'zeroDischarge',
  'limitationDurationDescription',
  'limitationDurationBaseType',
  'limitationUnitCode',
  'limitationUnitDescription',
  'limitationUnitBasis',
  'alternateLimitFlag',
  'alternateLimitDescription'
];

let order = [
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

        result.cfrSection = limitations[0].wastestreamProcessCfrSection;
        result.controlTechnologyCode = limitations[0].controlTechnologyCode;
        result.title = limitations[0].wastestreamProcessTitle;
        result.secondary = limitations[0].wastestreamProcessSecondary;
        result.limitations = limitations;

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

module.exports = {
  wastestreamProcessLimitations,
  pollutantLimitations
};
