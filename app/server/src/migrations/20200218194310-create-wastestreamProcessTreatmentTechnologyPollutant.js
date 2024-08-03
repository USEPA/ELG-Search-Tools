'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface
      .createTable(
        { schema: 'elg_search', tableName: 'WastestreamProcessTreatmentTechnologyPollutant' },
        {
          wastestreamProcessId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'processop_id',
          },
          treatmentId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'treatment_id',
          },
          pollutantId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: 'pollutant_code',
          },
        }
      )
      .then(() => {
        queryInterface
          .addIndex(
            { schema: 'elg_search', tableName: 'WastestreamProcessTreatmentTechnologyPollutant' },
            ['processop_id', 'treatment_id'],
            { name: 'idx_wpttp_pt' }
          )
          .then(() => {
            queryInterface
              .addIndex(
                { schema: 'elg_search', tableName: 'WastestreamProcessTreatmentTechnologyPollutant' },
                ['processop_id', 'pollutant_code'],
                { name: 'idx_wpttp_pp' }
              )
              .then(() => {
                queryInterface.addIndex(
                  { schema: 'elg_search', tableName: 'WastestreamProcessTreatmentTechnologyPollutant' },
                  ['treatment_id']
                );
              });
          });
      }),
  down: (queryInterface) =>
    queryInterface.dropTable({ schema: 'elg_search', tableName: 'WastestreamProcessTreatmentTechnologyPollutant' }),
};
