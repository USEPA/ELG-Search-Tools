module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'PollutantGroup',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'id',
        primaryKey: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'group_description',
      },
    },
    { timestamps: false, schema: 'elg_search', tableName: 'PollutantGroup' }
  );
};
