module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'ViewDefinition',
    {
      pointSourceCategoryCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'psc_code'
      },
      subcategoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'subcat_id'
      },
      subcategory: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'subcategory'
      },
      subcategoryCfrSection: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'subcat_cfr_section'
      },
      cfrSubsection: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'cfr_subsection'
      },
      term: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'term'
      },
      definition: {
        type: DataTypes.STRING(8000),
        allowNull: false,
        field: 'definition'
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'deftype'
      },
      cfrHasAdditionalDetails: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'additional_detail_cfr_flag'
      },
      typoFlagDefinition: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'typo_flag_definition'
      },
    },
    { timestamps: false, schema: 'elg_search', tableName: 'ViewDefinition'}
  )
};
