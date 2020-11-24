'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable({schema: 'elg_search', tableName: 'LongTermAverage'}, {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'ltaid',
      primaryKey: true
    },
    limitationId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'lim_id'
    },
    treatmentTechnologyId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'treatment_id'
    },
    longTermAverageValue: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'lta_value'
    },
    longTermAverageUnitId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      field: 'lta_units'
    },
    longTermAverageDurationId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      field: 'lim_duration_code'
    },
    dischargeFrequency: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'discharge_frequency'
    },
    technicalReferenceId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'tech_ref'
    },
    notes: {
      type: Sequelize.STRING(4000),
      allowNull: true,
      field: 'notes'
    },
  }).then(() => {
    queryInterface.addIndex(
      {schema: 'elg_search', tableName: 'LongTermAverage'},
      ['lim_id']
    )
  }),
  down: (queryInterface) => queryInterface.dropTable({schema: 'elg_search', tableName: 'LongTermAverage'})
};
