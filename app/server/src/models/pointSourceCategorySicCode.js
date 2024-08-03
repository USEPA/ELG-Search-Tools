module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'PointSourceCategorySicCode',
    {
      sicCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'sic',
      },
      generalPointSourceCategoryCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'general_psc_code',
      },
      specificSourceCategoryCode: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'specific_psc_code',
      },
      sicCodeAsNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'sic_code',
      },
    },
    { timestamps: false, schema: 'elg_search', tableName: 'PointSourceCategorySicCode' }
  );
};
