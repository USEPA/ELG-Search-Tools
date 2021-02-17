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
      },
      alternateLimitFlag: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'alt_lim_flag'
      },
      limitRequirementDescription: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'alt_lim'
      },
      alternateLimitDescription: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'alt_lim_description'
      },
      limitCalculationDescription: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'lim_calc_desc'
      },
      pollutantNotes: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'pollutant_notes'
      },
      typoFlagLimitationValue: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'typo_flag_lim_value'
      },
    },
    { timestamps: false, schema: 'elg_search', tableName: 'Limitation' }
  );
};
