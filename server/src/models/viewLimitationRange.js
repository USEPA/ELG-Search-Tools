module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'ViewLimitationRange',
    {
      limitationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'lim_id',
        primaryKey: true
      },
      limitationDisplayValue: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'display_value'
      },
      minimumDisplayValue: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'display_min'
      },
      maximumDisplayValue: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'display_max'
      },
      alternateLimitFlag: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'alt_lim_flag'
      },
      pollutantDescription: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'pollutant_desc'
      },
      limitationDisplayUnits: {
        type: DataTypes.STRING(4000),
        allowNull: false,
        field: 'display_units'
      },
      limitationDurationTypeDisplay: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'limit_type_display'
      },
    },
    { timestamps: false, schema: 'elg_search', tableName: 'ViewLimitationRange' }
  );
};
