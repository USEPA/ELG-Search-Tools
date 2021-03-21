module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'SicCode',
    {
      sicCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'sic',
        primaryKey: true
      },
      sicDescription: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'sic_desc'
      },
      sicCodeAsNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'sic_code'
      }
    },
    { timestamps: false, schema: 'elg_search', tableName: 'SicCode' }
  );
};
