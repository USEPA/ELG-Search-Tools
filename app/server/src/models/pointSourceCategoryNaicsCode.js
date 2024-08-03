module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'PointSourceCategoryNaicsCode',
    {
      naicsCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'naics',
      },
      pointSourceCategoryCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'psc_code',
      },
      naicsCodeAsNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'naics_code',
      },
    },
    { timestamps: false, schema: 'elg_search', tableName: 'PointSourceCategoryNaicsCode' }
  );
};
