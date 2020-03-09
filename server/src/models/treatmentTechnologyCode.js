module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'TreatmentTechnologyCode',
    {
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'code'
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'name'
      },
      description: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'description'
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'category'
      },
      variations: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'variations'
      }
    },
    { timestamps: false, schema: 'elg_search', tableName: 'TreatmentTechnologyCode' }
  );
};
