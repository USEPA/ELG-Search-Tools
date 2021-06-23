'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable({schema: 'elg_search', tableName: 'LimitationDuration'}, {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'limit_duration_code',
      primaryKey: true
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'limit_duration_description'
    },
    baseType: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'stat_base_type'
    },
    typeDisplay: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'limit_type_display'
    }
  }),
  down: (queryInterface) => queryInterface.dropTable({schema: 'elg_search', tableName: 'LimitationDuration'})
};
