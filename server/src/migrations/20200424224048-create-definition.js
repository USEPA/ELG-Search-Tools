'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable({schema: 'elg_search', tableName: 'Definition'}, {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'def_id',
      primaryKey: true
    },
    pointSourceCategoryCode: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'cfr_part'
    },
    cfrSection: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'subcat_cfr_section'
    },
    cfrSubsection: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'cfr_subsection'
    },
    term: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'term'
    },
    definition: {
      type: Sequelize.STRING(4000),
      allowNull: true,
      field: 'definition'
    },
    definitionType: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'deftype'
    },
    cfrHasAdditionalDetails: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      field: 'additional_detail_cfr_flag'
    },
    sourceId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      field: 'source_id'
    },
    qcFlag: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'qc_flag'
    },
    qcNotes: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'qc_notes'
    }
  }),
  down: (queryInterface) => queryInterface.dropTable({schema: 'elg_search', tableName: 'Definition'})
};
