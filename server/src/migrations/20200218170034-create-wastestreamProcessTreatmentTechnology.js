'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable({schema: 'elg_search', tableName: 'WastestreamProcessTreatmentTechnology'}, {
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
    technicalReferenceId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'tech_ref'
    },
    notes: {
      type: Sequelize.STRING(4000),
      allowNull: true,
      field: 'tech_notes'
    },
  }),
  down: (queryInterface) => queryInterface.dropTable({schema: 'elg_search', tableName: 'WastestreamProcessTreatmentTechnology'})
};
