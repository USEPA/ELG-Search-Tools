'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable(
      { schema: 'elg_search', tableName: 'LimitationUnit' },
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          field: 'unit_code',
          primaryKey: true,
        },
        code: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'unit',
        },
        description: {
          type: Sequelize.STRING(4000),
          allowNull: true,
          field: 'unit_desc',
        },
        basis: {
          type: Sequelize.STRING,
          allowNull: true,
          field: 'unit_basis',
        },
      }
    ),
  down: (queryInterface) => queryInterface.dropTable({ schema: 'elg_search', tableName: 'LimitationUnit' }),
};
