'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable({schema: 'elg_search', tableName: 'GeneralProvision'}, {
    pointSourceCategoryCode: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'psc_code'
    },
    cfrSection: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'genprov_cfr_section'
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'genprov_section_title'
    },
    description: {
      type: Sequelize.STRING(8000),
      allowNull: false,
      field: 'genprov_desc'
    },
    isMonitoringRequirement: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      field: 'genprov_monitoring_reqs'
    },
    isBMP: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      field: 'genprov_bmps_reqs'
    },
    cfrHasAdditionalDetails: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      field: 'additional_detail_in_cfr_'
    },
    sourceId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      field: 'genprov_source_id'
    }
  }),
  down: (queryInterface) => queryInterface.dropTable({schema: 'elg_search', tableName: 'GeneralProvision'})
};
