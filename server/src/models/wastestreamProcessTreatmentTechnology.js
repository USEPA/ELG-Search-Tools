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
      },
      technicalReferenceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'tech_ref'
      },
      notes: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'tech_notes'
      },
      bmpType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'bmp_type'
      },
      zeroDischarge: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'zero_discharge'
      }
    },
    { timestamps: false, schema: 'elg_search', tableName: 'WastestreamProcessTreatmentTechnology' }
  );
};
