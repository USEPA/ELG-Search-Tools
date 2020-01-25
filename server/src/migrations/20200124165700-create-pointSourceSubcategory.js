'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable({schema: 'elg_search', tableName: 'PointSourceSubcategory'}, {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'subcat_id',
      primaryKey: true
    },
    pointSourceCategoryCode: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'psc_code'
    },
    pointSourceSubcategoryCode: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'subcat_code'
    },
    pointSourceSubcategoryTitle: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'subcat_title'
    },
    pointSourceSubcategoryCfrSection: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'subcat_cfr_section'
    },
    pointSourceSubcategoryApplicability: {
      type: Sequelize.STRING(4000),
      allowNull: true,
      field: 'subcat_applicability'
    },
    includesBmps: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'subcat_includes_bmps'
    },
    pointSourceSubcategoryNotes: {
      type: Sequelize.STRING(4000),
      allowNull: true,
      field: 'subcat_notes'
    },
    moreDetailFlag: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'moredetail_flag'
    },
    sourceId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      field: 'source_id'
    },
    detailDescription: {
      type: Sequelize.STRING,
      allowNull: true,
      field: 'detail_desc'
    },
    comboSubcategory: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'combo_subcat'
    },
    reservedFlag: {
      type: Sequelize.STRING,
      allowNull: false,
      field: 'reservedflag'
    },
  }),
  down: (queryInterface) => queryInterface.dropTable({schema: 'elg_search', tableName: 'PointSourceSubcategory'})
};
