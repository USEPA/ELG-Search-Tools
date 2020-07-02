module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'ViewWastestreamProcessTreatmentTechnologyPollutant',
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
      },
      elgPollutantDescription: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'elg_pollutant_description'
      }
    },
    { timestamps: false, schema: 'elg_search', tableName: 'ViewWastestreamProcessTreatmentTechnologyPollutant' }
  );
};
