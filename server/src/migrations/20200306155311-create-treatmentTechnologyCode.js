'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable({schema: 'elg_search', tableName: 'TreatmentTechnologyCode'}, {
    code: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'code'
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'name'
    },
    description: {
      type: Sequelize.STRING(4000),
      allowNull: true,
      field: 'description'
    },
    category: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'category'
    },
    variations: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'variations'
    }
  }),
  down: (queryInterface) => queryInterface.dropTable({schema: 'elg_search', tableName: 'TreatmentTechnologyCode'})
};
