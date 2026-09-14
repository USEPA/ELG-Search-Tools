const utilities = require('./utilities');
const logger = require('../../utilities/logger.js');
const log = logger.logger;

const PointSourceSubcategory = require('../models').PointSourceSubcategory;
const ControlTechnology = require('../models').ControlTechnology;
const ControlTechnologyNotes = require('../models').ControlTechnologyNotes;
const WastestreamProcess = require('../models').WastestreamProcess;
const WastestreamProcessTreatmentTechnology = require('../models').WastestreamProcessTreatmentTechnology;
const TreatmentTechnology = require('../models').TreatmentTechnology;
const TreatmentTechnologyCode = require('../models').TreatmentTechnologyCode;
const ViewLimitation = require('../models').ViewLimitation;
const Op = require('sequelize').Op;
const Sequelize = require('sequelize');

async function fillControlTechnology(controlTechnology) {
  let ct = {
    id: controlTechnology.id,
    controlTechnologyCode: controlTechnology.controlTechnologyCode,
    controlTechnologyDescription: utilities.getControlTechnologyDescription(controlTechnology.controlTechnologyCode),
    atAGlance: controlTechnology.notes,
    notes: [],
    technologyNames: '',
    pollutants: '',
    includesBmp: controlTechnology.includesBmps !== '0',
    wastestreamProcesses: [],
  };

  // placeholder records for LOCs absent from this subcategory have no cfrSection, so their notes can never match
  if (controlTechnology.cfrSection) {
    ct['notes'] = await ControlTechnologyNotes.findAll({
      attributes: ['cfrSection', ['ct_notes', 'notes']],
      where: {
        controlTechnologyCode: { [Op.eq]: controlTechnology.controlTechnologyCode },
        cfrSection: { [Op.iLike]: controlTechnology.cfrSection + '%' },
        display: { [Op.eq]: true },
        [Op.and]: [
          Sequelize.literal(
            "split_part(ct_cfr_section, '.', 1) = split_part('" + controlTechnology.cfrSection + "', '.', 1)"
          ),
          Sequelize.literal(
            "split_part(ct_cfr_section, '.', 2) = split_part('" + controlTechnology.cfrSection + "', '.', 2)"
          ),
        ],
      },
      order: ['cfrSection'],
    });
  }

  const wastestreamProcesses = await WastestreamProcess.findAll({
    attributes: [
      'id',
      'controlTechnologyId',
      'cfrSection',
      'title',
      'secondary',
      ['processop_description', 'description'],
      ['processop_notes', 'notes'],
      ['lim_calc_desc', 'limitCalculationDescription'],
      'sourceId',
      'zeroDischarge',
      'includesBmps',
      'noLimitations',
      'alternativeRequirement',
      'voluntaryRequirement',
      'additionalDetail',
      [Sequelize.literal("split_part(cfr_sect, '.', 1) || '_1' || split_part(cfr_sect, '.', 2)"), 'cfrSectionAnchor'],
      'typoFlagLimitCalculationDescription',
      'typoFlagNotes',
      [
        Sequelize.literal(
          '(select count(l.lim_id) from elg_search."Limitation" l where l.processop_id = "WastestreamProcess".processop_id)'
        ),
        'limitationCount',
      ],
    ],
    where: {
      controlTechnologyId: { [Op.eq]: controlTechnology.id },
    },
    order: ['displayOrder'],
    raw: true,
  });

  ct['wastestreamProcesses'] = wastestreamProcesses;

  const wastestreamProcessIds = wastestreamProcesses.map((a) => a.id);

  const wastestreamProcessTreatmentTechnologies = await WastestreamProcessTreatmentTechnology.findAll({
    attributes: ['treatmentId'],
    where: {
      wastestreamProcessId: { [Op.in]: wastestreamProcessIds },
    },
  });

  // use limitations to get pollutants
  const pollutants = await ViewLimitation.findAll({
    attributes: [
      [Sequelize.fn('DISTINCT', Sequelize.col('pollutant_code')), 'pollutantId'],
      [Sequelize.col('elg_pollutant_description'), 'elgPollutantDescription'],
    ],
    where: {
      wastestreamProcessId: { [Op.in]: wastestreamProcessIds },
    },
  });

  ct['pollutants'] = pollutants
    .map((a) => a.elgPollutantDescription)
    .join('; ')
    .split('; ')
    .sort()
    .filter(function (value, index, self) {
      return self.indexOf(value) === index;
    })
    .join('; ');

  if (wastestreamProcessTreatmentTechnologies.length > 0) {
    const treatmentTechnologies = await TreatmentTechnology.findAll({
      attributes: ['codes'],
      where: {
        id: { [Op.in]: wastestreamProcessTreatmentTechnologies.map((a) => a.treatmentId) },
      },
    });

    const treatmentTechnologyCodes = await TreatmentTechnologyCode.findAll({
      attributes: ['name'],
      where: {
        code: {
          [Op.in]: treatmentTechnologies
            .map((a) => a.codes)
            .join('; ')
            .split('; '),
        },
      },
      group: ['name'],
      order: ['name'],
    });

    ct['technologyNames'] = treatmentTechnologyCodes.map((a) => a.name).join('; ');
  }

  return ct;
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
        attributes: ['id', 'pointSourceSubcategoryCode', 'pointSourceSubcategoryTitle', 'comboSubcategory'],
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
   * @param req
   * @param res
   */
  async read(req, res) {
    // check for required query attributes and replace with defaults if missing
    let id = utilities.parseIdAsInteger(req.params.id);

    if (id === null) {
      return res.status(400).send('Invalid value passed for id');
    }

    try {
      const pointSourceSubcategory = await PointSourceSubcategory.findByPk(id, {
        attributes: ['id', 'pointSourceSubcategoryCode', 'pointSourceSubcategoryTitle', 'comboSubcategory'],
      });

      let result = new Map();

      if (!pointSourceSubcategory) {
        return res.status(200).send(result);
      }

      result['id'] = pointSourceSubcategory.id;
      result['pointSourceSubcategoryCode'] = pointSourceSubcategory.pointSourceSubcategoryCode;
      result['pointSourceSubcategoryTitle'] = pointSourceSubcategory.pointSourceSubcategoryTitle;
      result['comboSubcategory'] = pointSourceSubcategory.comboSubcategory;
      result['controlTechnologies'] = [];

      const controlTechnologies = await ControlTechnology.findAll({
        attributes: ['id', 'controlTechnologyCode', 'cfrSection', 'includesBmps', 'notes'],
        where: {
          pointSourceSubcategoryId: { [Op.eq]: id },
          controlTechnologyCode: { [Op.in]: ['BPT', 'BCT', 'BAT', 'NSPS', 'PSES', 'PSNS'] },
        },
        order: ['displayOrder'],
      });

      const cts = await Promise.all(
        controlTechnologies.map((controlTechnology) => fillControlTechnology(controlTechnology))
      );

      //add record for each LOC that is not relevant for this subcategory
      const missingCtPromises = [];

      ['BPT', 'BAT', 'BCT', 'NSPS', 'PSES', 'PSNS'].forEach(function (ctCode, index) {
        if (
          cts.filter(function (ct) {
            return ct.controlTechnologyCode === ctCode;
          }).length === 0
        ) {
          missingCtPromises.push(
            fillControlTechnology({
              id: index * -1,
              controlTechnologyCode: ctCode,
              notes: null,
              includesBmps: '0',
            })
          );
        }
      });

      const missingCts = await Promise.all(missingCtPromises);

      result['controlTechnologies'] = cts.concat(missingCts);
      res.status(200).send(result);
    } catch (error) {
      log.error('pointSourceSubcategory.read failed for id ' + id + '; ' + error);
      res.status(400).send('Error! ' + utilities.sanitizeError(error));
    }
  },
};
