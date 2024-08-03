'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable(
      { schema: 'elg_search', tableName: 'PointSourceCategoryNaicsCode' },
      {
        naicsCode: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'naics',
        },
        pointSourceCategoryCode: {
          type: Sequelize.INTEGER,
          allowNull: false,
          field: 'psc_code',
        },
        naicsCodeAsNumber: {
          type: Sequelize.INTEGER,
          allowNull: true,
          field: 'naics_code',
        },
      }
    ),
  down: (queryInterface) =>
    queryInterface.dropTable({ schema: 'elg_search', tableName: 'PointSourceCategoryNaicsCode' }),
};
