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
      allowNull: true,
      field: 'tech_ref'
    },
    notes: {
      type: Sequelize.STRING(4000),
      allowNull: true,
      field: 'tech_notes'
    },
    bmpType: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'bmp_type'
    },
    zeroDischarge: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      field: 'zero_discharge'
    }
  }).then(() => {
    queryInterface.addIndex(
      {schema: 'elg_search', tableName: 'WastestreamProcessTreatmentTechnology'},
      ['processop_id', 'treatment_id']
    ).then(() => {
      queryInterface.addIndex(
        {schema: 'elg_search', tableName: 'TreatmentTechnology'},
        ['tech_notes']
      )
    })
  }),
  down: (queryInterface) => queryInterface.dropTable({schema: 'elg_search', tableName: 'WastestreamProcessTreatmentTechnology'})
};
