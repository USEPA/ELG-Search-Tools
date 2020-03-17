module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'TreatmentTechnologyCode',
    {
      id: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'code',
        primaryKey: true
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
