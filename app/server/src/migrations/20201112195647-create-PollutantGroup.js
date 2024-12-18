'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable(
      { schema: 'elg_search', tableName: 'PollutantGroup' },
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          field: 'id',
          primaryKey: true,
        },
        description: {
          type: Sequelize.STRING,
          allowNull: true,
          field: 'group_description',
        },
      }
    ),
  down: (queryInterface) => queryInterface.dropTable({ schema: 'elg_search', tableName: 'PollutantGroup' }),
};
