'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable({schema: 'elg_search', tableName: 'TreatmentTechnology'}, {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'treatment_id',
      primaryKey: true
    },
    codes: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'treatment_codes'
    },
    description: {
      type: Sequelize.STRING(4000),
      allowNull: true,
      field: 'treatment_description'
    }
  }),
  down: (queryInterface) => queryInterface.dropTable({schema: 'elg_search', tableName: 'TreatmentTechnology'})
};
