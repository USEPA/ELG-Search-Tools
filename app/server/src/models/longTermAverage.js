module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'LongTermAverage',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'ltaid',
        primaryKey: true,
      },
      limitationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'lim_id',
      },
      treatmentTechnologyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'treatment_id',
      },
      longTermAverageValue: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'lta_value',
      },
      longTermAverageUnitId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'lta_units',
      },
      longTermAverageDurationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'lim_duration_code',
      },
      dischargeFrequency: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'discharge_frequency',
      },
      technicalReferenceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'tech_ref',
      },
      notes: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'notes',
      },
    },
    { timestamps: false, schema: 'elg_search', tableName: 'LongTermAverage' }
  );
};
