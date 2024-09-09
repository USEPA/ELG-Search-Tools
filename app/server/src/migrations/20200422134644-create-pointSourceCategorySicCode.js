'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable(
      { schema: 'elg_search', tableName: 'PointSourceCategorySicCode' },
      {
        sicCode: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'sic',
        },
        generalPointSourceCategoryCode: {
          type: Sequelize.INTEGER,
          allowNull: false,
          field: 'general_psc_code',
        },
        specificSourceCategoryCode: {
          type: Sequelize.STRING,
          allowNull: true,
          field: 'specific_psc_code',
        },
        sicCodeAsNumber: {
          type: Sequelize.INTEGER,
          allowNull: true,
          field: 'sic_code',
        },
      }
    ),
  down: (queryInterface) => queryInterface.dropTable({ schema: 'elg_search', tableName: 'PointSourceCategorySicCode' }),
};
