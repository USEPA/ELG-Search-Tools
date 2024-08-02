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
        allowNull: false,
        field: 'pollutant_desc'
      },
      elgDescription: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'elg_pollutant_description'
      },
      pollutantGroups: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'pollutant_groups'
      }
    },
    { timestamps: false, schema: 'elg_search', tableName: 'Pollutant' }
  );
};
