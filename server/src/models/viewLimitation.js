module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'ViewLimitation',
    {
      limitationId: {
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
      wastestreamProcessTitle: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'processop_title'
      },
      wastestreamProcessSecondary: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'secondary'
      },
      wastestreamProcessDisplayOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'sortorder'
      },
      pollutantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'pollutant_code'
      },
      pollutantDescription: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'pollutant_desc'
      },
      limitationDurationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'lim_duration_code'
      },
      limitationDurationDescription: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'limit_duration_description'
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
      limitationUnitCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'unit'
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
      pointSourceCategoryCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'psc_code'
      },
      pointSourceCategoryName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'psc_name'
      },
      comboSubcategory: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'combo_subcat'
      },
      pointSourceSubcategoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'subcat_id'
      },
      controlTechnologyCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'ct_code'
      }
    },
    { timestamps: false, schema: 'elg_search', tableName: 'ViewLimitation' }
  );
};
