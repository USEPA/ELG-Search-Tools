module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'Limitation',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'lim_id',
        primaryKey: true
      },
      wastestreamProcessId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'processop_id'
      },
      pollutantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'pollutant_code'
      },
      limitationDurationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'lim_duration_code'
      },
      dischargeFrequency: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'discharge_frequency'
      },
      limitationValue: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'lim_value'
      },
      limitationUnitId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'unit_code'
      },
      minimumValue: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'lim_value_min'
      },
      maximumValue: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'lim_value_max'
      },
      zeroDischarge: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'zero_discharge'
      }
    },
    { timestamps: false, schema: 'elg_search', tableName: 'Limitation' }
  );
};
