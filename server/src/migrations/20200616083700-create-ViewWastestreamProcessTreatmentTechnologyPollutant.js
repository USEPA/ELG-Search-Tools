'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.query('CREATE VIEW elg_search."ViewWastestreamProcessTreatmentTechnologyPollutant" as ' +
    'select wpttp.processop_id, wpttp.treatment_id, wpttp.pollutant_code, p.elg_pollutant_description ' +
    'from elg_search."WastestreamProcessTreatmentTechnologyPollutant" wpttp ' +
    'inner join elg_search."Pollutant" p on wpttp.pollutant_code = p.pollutant_code'),
  down: (queryInterface, Sequelize) => queryInterface.sequelize.query('DROP VIEW elg_search."ViewWastestreamProcessTreatmentTechnologyPollutant"')
};
