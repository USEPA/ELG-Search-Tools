module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'Pollutant',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'pollutant_code',
        primaryKey: true
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'pollutant_desc'
      }
    },
    { timestamps: false, schema: 'elg_search', tableName: 'Pollutant' }
  );
};
