module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'LimitationDuration',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'limit_duration_code',
        primaryKey: true
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'limit_duration_description'
      },
      baseType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'stat_base_type'
      },
      typeDisplay: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'limit_type_display'
      }
    },
    { timestamps: false, schema: 'elg_search', tableName: 'LimitationDuration' }
  );
};
