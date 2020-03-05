'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable({schema: 'elg_search', tableName: 'ReferenceSource'}, {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'source_id',
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING(4000),
      allowNull: true,
      field: 'source_title'
    }
  }),
  down: (queryInterface) => queryInterface.dropTable({schema: 'elg_search', tableName: 'ReferenceSource'})
};
