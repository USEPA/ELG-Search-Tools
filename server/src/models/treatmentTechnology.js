module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'TreatmentTechnology',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'treatment_id',
        primaryKey: true
      },
      codes: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'treatment_codes'
      },
      names: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'treatment_names'
      },
      description: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'treatment_description'
      }
    },
    { timestamps: false, schema: 'elg_search', tableName: 'TreatmentTechnology' }
  );
};
