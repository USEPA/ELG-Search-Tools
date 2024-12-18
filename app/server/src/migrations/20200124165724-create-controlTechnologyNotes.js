'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable(
      { schema: 'elg_search', tableName: 'ControlTechnologyNotes' },
      {
        controlTechnologyCode: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'loc',
        },
        cfrSection: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'ct_cfr_section',
        },
        notes: {
          type: Sequelize.STRING(8000),
          allowNull: false,
          field: 'ct_notes',
        },
        display: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          field: 'loc_display',
        },
        typoFlagNotes: {
          type: Sequelize.STRING(4000),
          allowNull: true,
          field: 'typo_flag_ct_notes',
        },
      }
    ),
  down: (queryInterface) => queryInterface.dropTable({ schema: 'elg_search', tableName: 'ControlTechnologyNotes' }),
};
