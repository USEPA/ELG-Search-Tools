'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable({schema: 'elg_search', tableName: 'WastestreamProcessTreatmentTechnologyPollutant'}, {
    wastestreamProcessId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'processop_id'
    },
    treatmentId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'treatment_id'
    },
    pollutantId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'pollutant_code'
    }
  }),
  down: (queryInterface) => queryInterface.dropTable({schema: 'elg_search', tableName: 'WastestreamProcessTreatmentTechnologyPollutant'})
};
