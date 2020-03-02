'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable({schema: 'elg_search', tableName: 'WastestreamProcess'}, {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'processop_id',
      primaryKey: true
    },
    controlTechnologyId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'ct_id'
    },
    cfrSection: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'cfr_sect'
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'processop_title'
    },
    secondary: {
      type: Sequelize.STRING(4000),
      allowNull: true,
      field: 'secondary'
    },
    description: {
      type: Sequelize.STRING(4000),
      allowNull: true,
      field: 'processop_description'
    },
    notes: {
      type: Sequelize.STRING(4000),
      allowNull: true,
      field: 'processop_notes'
    },
    limitCalculationDescription: {
      type: Sequelize.STRING(4000),
      allowNull: true,
      field: 'lim_calc_desc'
    },
    displayOrder: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'sortorder'
    },
    sourceId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      field: 'source_id'
    },
    zeroDischarge: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      field: 'zero_discharge'
    },
    includesBmps: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      field: 'includes_bmps'
    },
    noLimitations: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      field: 'no_limits'
    },
    alternativeRequirement: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      field: 'alternative_requirement'
    },
    additionalDetail: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      field: 'process_addtdetail'
    }
  }),
  down: (queryInterface) => queryInterface.dropTable({schema: 'elg_search', tableName: 'WastestreamProcess'})
};
