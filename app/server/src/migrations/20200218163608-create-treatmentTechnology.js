'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface
      .createTable(
        { schema: 'elg_search', tableName: 'TreatmentTechnology' },
        {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'treatment_id',
            primaryKey: true,
          },
          codes: {
            type: Sequelize.STRING,
            allowNull: false,
            field: 'treatment_codes',
          },
          names: {
            type: Sequelize.STRING,
            allowNull: true,
            field: 'treatment_names',
          },
          description: {
            type: Sequelize.STRING(4000),
            allowNull: true,
            field: 'treatment_description',
          },
          descriptions: {
            type: Sequelize.STRING(4000),
            allowNull: true,
            field: 'treatment_descriptions',
          },
        }
      )
      .then(() => {
        queryInterface
          .addIndex({ schema: 'elg_search', tableName: 'TreatmentTechnology' }, ['treatment_codes'])
          .then(() => {
            queryInterface.addIndex({ schema: 'elg_search', tableName: 'TreatmentTechnology' }, ['treatment_names']);
          });
      }),
  down: (queryInterface) => queryInterface.dropTable({ schema: 'elg_search', tableName: 'TreatmentTechnology' }),
};
