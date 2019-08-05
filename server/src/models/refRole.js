module.exports = (sequelize, DataTypes) => {
  const RefRole = sequelize.define(
    'RefRole',
    {
      code: DataTypes.STRING,
      label: DataTypes.STRING,
    },
    {
      timestamps: false,
    }
  );
  return RefRole;
};
