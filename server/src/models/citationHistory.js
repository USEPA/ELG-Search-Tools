module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'CitationHistory',
    {
      pointSourceCategoryCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'psc'
      },
      cfrSection: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'cfr_section'
      },
      subcategory: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'subcategory'
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'cfr_section_description'
      },
      federalRegisterNoticeInCfr: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'frn__in_cfr_'
      },
      federalRegisterNoticeFirstPage: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'frn__1st_page_'
      },
      publicationDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'publication_date'
      },
      sourceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'source_id'
      },
      notes: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'notes'
      }
    },
    { timestamps: false, schema: 'elg_search', tableName: 'CitationHistory'}
  )
};
