'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable({schema: 'elg_search', tableName: 'Limitation'}, {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'lim_id',
      primaryKey: true
    },
    wastestreamProcessId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'processop_id'
    },
    pollutantId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'pollutant_code'
    },
    limitationDurationId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'lim_duration_code'
    },
    dischargeFrequency: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'discharge_frequency'
    },
    limitationValue: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'lim_value'
    },
    limitationUnitId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      field: 'unit_code'
    },
    minimumValue: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'lim_value_min'
    },
    maximumValue: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'lim_value_max'
    },
    zeroDischarge: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'zero_discharge'
    }
  }),
  down: (queryInterface) => queryInterface.dropTable({schema: 'elg_search', tableName: 'Limitation'})
};
