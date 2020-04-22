'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable({schema: 'elg_search', tableName: 'SicCode'}, {
    sicCode: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'sic',
      primaryKey: true
    },
    sicDescription: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'sic_desc'
    }
  }),
  down: (queryInterface) => queryInterface.dropTable({schema: 'elg_search', tableName: 'SicCode'})
};
