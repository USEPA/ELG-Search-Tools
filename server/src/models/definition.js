module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'Definition',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'def_id',
        primaryKey: true
      },
      pointSourceCategoryCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'cfr_part'
      },
      cfrSection: {
        type: DataTypes.STRING,
        allowNull: true,
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
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'definition'
      },
      definitionType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'deftype'
      },
      cfrHasAdditionalDetails: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'additional_detail_cfr_flag'
      },
      sourceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'source_id'
      },
      qcFlag: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'qc_flag'
      },
      qcNotes: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'qc_notes'
      },
      typoFlagDefinition: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'typo_flag_definition'
      },
    },
    { timestamps: false, schema: 'elg_search', tableName: 'Definition'}
  )
};
