module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'NaicsCode',
    {
      naicsCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'naics',
        primaryKey: true
      },
      naicsDescription: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'naics_desc'
      },
    },
    { timestamps: false, schema: 'elg_search', tableName: 'NaicsCode' }
  );
};
