'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable(
      { schema: 'elg_search', tableName: 'CitationHistory' },
      {
        pointSourceCategoryCode: {
          type: Sequelize.INTEGER,
          allowNull: false,
          field: 'psc',
        },
        cfrSection: {
          type: Sequelize.STRING,
          allowNull: true,
          field: 'cfr_section',
        },
        subcategory: {
          type: Sequelize.STRING,
          allowNull: true,
          field: 'subcategory',
        },
        description: {
          type: Sequelize.STRING,
          allowNull: true,
          field: 'cfr_section_description',
        },
        federalRegisterNoticeInCfr: {
          type: Sequelize.STRING,
          allowNull: true,
          field: 'frn__in_cfr_',
        },
        federalRegisterNoticeFirstPage: {
          type: Sequelize.STRING,
          allowNull: true,
          field: 'frn__1st_page_',
        },
        publicationDate: {
          type: Sequelize.DATE,
          allowNull: true,
          field: 'publication_date',
        },
        sourceId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          field: 'source_id',
        },
        notes: {
          type: Sequelize.STRING,
          allowNull: true,
          field: 'notes',
        },
      }
    ),
  down: (queryInterface) => queryInterface.dropTable({ schema: 'elg_search', tableName: 'CitationHistory' }),
};
