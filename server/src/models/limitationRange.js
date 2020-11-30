module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'LimitationRange',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'lim_id',
        primaryKey: true
      },
      alternateLimitFlag: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'alt_lim_flag'
      },
      value: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'display_value'
      },
      minimumValue: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'display_min'
      },
      maximumValue: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'display_max'
      },
      units: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'display_units'
      }
    },
    { timestamps: false, schema: 'elg_search', tableName: 'LimitationRange' }
  );
};
