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
    treatmentId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      field: 'treatment_id'
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
    },
    alternateLimitFlag: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'alt_lim_flag'
    },
    limitRequirementDescription: {
      type: Sequelize.STRING(4000),
      allowNull: true,
      field: 'alt_lim'
    },
    alternateLimitDescription: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'alt_lim_description'
    },
    limitCalculationDescription: {
      type: Sequelize.STRING(4000),
      allowNull: true,
      field: 'lim_calc_desc'
    },
    pollutantNotes: {
      type: Sequelize.STRING(4000),
      allowNull: true,
      field: 'pollutant_notes'
    },
    typoFlagLimitationValue: {
      type: Sequelize.STRING(4000),
      allowNull: true,
      field: 'typo_flag_lim_value'
    },
  }).then(() => {
    queryInterface.addIndex(
      {schema: 'elg_search', tableName: 'Limitation'},
      ['processop_id']
    ).then(() => {
      queryInterface.addIndex(
        {schema: 'elg_search', tableName: 'Limitation'},
        ['pollutant_code']
      ).then(() => {
        queryInterface.addIndex(
          {schema: 'elg_search', tableName: 'Limitation'},
          ['alt_lim_flag']
        ).then(() => {
          queryInterface.addIndex(
            {schema: 'elg_search', tableName: 'Limitation'},
            ['alt_lim']
          ).then(() => {
            queryInterface.addIndex(
              {schema: 'elg_search', tableName: 'Limitation'},
              ['pollutant_notes']
            )
          })
        })
      })
    })
  }),
  down: (queryInterface) => queryInterface.dropTable({schema: 'elg_search', tableName: 'Limitation'})
};
