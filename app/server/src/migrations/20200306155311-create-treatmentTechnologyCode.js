'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable(
      { schema: 'elg_search', tableName: 'TreatmentTechnologyCode' },
      {
        id: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'code',
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'name',
        },
        description: {
          type: Sequelize.STRING(4000),
          allowNull: true,
          field: 'description',
        },
        category: {
          type: Sequelize.STRING,
          allowNull: true,
          field: 'category',
        },
        variations: {
          type: Sequelize.STRING,
          allowNull: true,
          field: 'variations',
        },
      }
    ),
  down: (queryInterface) => queryInterface.dropTable({ schema: 'elg_search', tableName: 'TreatmentTechnologyCode' }),
};
