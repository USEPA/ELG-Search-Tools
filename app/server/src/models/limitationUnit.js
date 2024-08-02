module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'LimitationUnit',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'unit_code',
        primaryKey: true
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'unit'
      },
      description: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'unit_desc'
      },
      basis: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'unit_basis'
      }
    },
    { timestamps: false, schema: 'elg_search', tableName: 'LimitationUnit' }
  );
};
