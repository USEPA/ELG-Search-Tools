module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'ReferenceSource',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'source_id',
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'source_title'
      }
    },
    { timestamps: false, schema: 'elg_search', tableName: 'ReferenceSource' }
  );
};
