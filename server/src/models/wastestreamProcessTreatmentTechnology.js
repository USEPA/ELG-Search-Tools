module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'WastestreamProcessTreatmentTechnology',
    {
      wastestreamProcessId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'processop_id'
      },
      treatmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'treatment_id'
      }
    },
    { timestamps: false, schema: 'elg_search', tableName: 'WastestreamProcessTreatmentTechnology' }
  );
};
