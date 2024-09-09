module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'PointSourceCategory',
    {
      pointSourceCategoryCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'psc_code',
        primaryKey: true,
      },
      cfrPart: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'cfr_part',
      },
      pointSourceCategoryName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'psc_name',
      },
      cfrNotes: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'cfr_notes',
      },
      narrativeHistory: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'narrative_history',
      },
      sourceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'source_id',
      },
      initialPromulgationDate: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'initial_promulgation_date',
      },
      includeInSearchTool: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'IncludeInSearchTool',
        defaultValue: false,
      },
      mostRecentRevisionDate: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'most_recent_revision_date',
      },
      linkUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'link_url',
      },
    },
    { timestamps: false, schema: 'elg_search', tableName: 'PointSourceCategory' }
  );
};
