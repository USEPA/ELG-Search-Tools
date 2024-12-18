'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable(
      { schema: 'elg_search', tableName: 'LimitationRange' },
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          field: 'lim_id',
          primaryKey: true,
        },
        alternateLimitFlag: {
          type: Sequelize.STRING,
          allowNull: true,
          field: 'alt_lim_flag',
        },
        value: {
          type: Sequelize.STRING,
          allowNull: true,
          field: 'display_value',
        },
        minimumValue: {
          type: Sequelize.STRING,
          allowNull: true,
          field: 'display_min',
        },
        maximumValue: {
          type: Sequelize.STRING,
          allowNull: true,
          field: 'display_max',
        },
        units: {
          type: Sequelize.STRING,
          allowNull: false,
          field: 'display_units',
        },
      }
    ),
  down: (queryInterface) => queryInterface.dropTable({ schema: 'elg_search', tableName: 'LimitationRange' }),
};
