'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable({schema: 'elg_search', tableName: 'Pollutant'}, {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'pollutant_code',
      primaryKey: true
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'pollutant_desc'
    }
  }),
  down: (queryInterface) => queryInterface.dropTable({schema: 'elg_search', tableName: 'Pollutant'})
};
