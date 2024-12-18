'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable(
      { schema: 'elg_search', tableName: 'NaicsCode' },
      {
        naicsCode: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'naics',
          primaryKey: true,
        },
        naicsDescription: {
          type: Sequelize.STRING,
          allowNull: true,
          field: 'naics_desc',
        },
        naicsCodeAsNumber: {
          type: Sequelize.INTEGER,
          allowNull: true,
          field: 'naics_code',
        },
      }
    ),
  down: (queryInterface) => queryInterface.dropTable({ schema: 'elg_search', tableName: 'NaicsCode' }),
};
