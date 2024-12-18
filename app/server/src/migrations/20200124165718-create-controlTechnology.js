'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface
      .createTable(
        { schema: 'elg_search', tableName: 'ControlTechnology' },
        {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'ct_id',
            primaryKey: true,
          },
          pointSourceSubcategoryId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'subcat_id',
          },
          controlTechnologyCode: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'ct_code',
          },
          displayOrder: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'ct_order',
          },
          cfrSection: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'ct_cfr_section',
          },
          notes: {
            type: Sequelize.STRING,
            allowNull: true,
            field: 'ct_notes',
          },
          sourceId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            field: 'source_id',
          },
          reservedFlag: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'reservedflag',
          },
          qcFlag: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'qc_flag',
          },
          qcNotes: {
            type: Sequelize.STRING,
            allowNull: true,
            field: 'qc_notes',
          },
          includesBmps: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'includesbmps',
          },
        }
      )
      .then(() => {
        queryInterface.addIndex({ schema: 'elg_search', tableName: 'ControlTechnology' }, ['subcat_id']);
      }),
  down: (queryInterface) => queryInterface.dropTable({ schema: 'elg_search', tableName: 'ControlTechnology' }),
};
