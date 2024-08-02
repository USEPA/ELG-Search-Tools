module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'WastestreamProcessTreatmentTechnologyPollutant',
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
      },
      pollutantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'pollutant_code'
      }
    },
    { timestamps: false, schema: 'elg_search', tableName: 'WastestreamProcessTreatmentTechnologyPollutant' }
  );
};
