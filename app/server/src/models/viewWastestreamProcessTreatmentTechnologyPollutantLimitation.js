module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'ViewWastestreamProcessTreatmentTechnologyPollutantLimitation',
    {
      limitationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'lim_id',
        primaryKey: true,
      },
      dischargeFrequency: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'discharge_frequency',
      },
      limitationValue: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'lim_value',
      },
      limitationValueAsNumber: {
        type: DataTypes.NUMBER,
        allowNull: true,
        field: 'lim_value_numeric',
      },
      typoFlagLimitationValue: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'typo_flag_lim_value',
      },
      minimumValue: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'lim_value_min',
      },
      maximumValue: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'lim_value_max',
      },
      zeroDischarge: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: 'zero_discharge',
      },
      alternateLimitFlag: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'alt_lim_flag',
      },
      limitRequirementDescription: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'alt_lim',
      },
      alternateLimitDescription: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'alt_lim_description',
      },
      wastestreamProcessId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'processop_id',
      },
      wastestreamProcessTitle: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'processop_title',
      },
      wastestreamProcessSecondary: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'secondary',
      },
      wastestreamProcessDisplayOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'sortorder',
      },
      wastestreamProcessCfrSection: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'wp_cfr_sect',
      },
      wastestreamProcessDescription: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'processop_description',
      },
      wastestreamProcessNotes: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'processop_notes',
      },
      wastestreamProcessLimitCalculationDescription: {
        type: DataTypes.STRING(4000),
        allowNull: false,
        field: 'wp_lim_calc_desc',
      },
      wastestreamProcessTypoFlagLimitCalculationDescription: {
        type: DataTypes.STRING(4000),
        allowNull: false,
        field: 'wp_typo_flag_lim_calc_description',
      },
      wastestreamProcessAlternativeRequirement: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'alternative_requirement',
      },
      wastestreamProcessVoluntaryRequirement: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'voluntary_requirement',
      },
      wastestreamProcessAdditionalDetails: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'process_addtdetail',
      },
      pollutantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'pollutant_code',
      },
      pollutantDescription: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'pollutant_desc',
      },
      elgPollutantDescription: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'elg_pollutant_description',
      },
      limitationDurationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'limit_duration_code',
      },
      limitationDurationDescription: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'limit_duration_description',
      },
      limitationDurationBaseType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'stat_base_type',
      },
      limitationDurationTypeDisplay: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'limit_type_display',
      },
      limitationUnitId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'unit_code',
      },
      limitationUnitCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'unit',
      },
      limitationUnitDescription: {
        type: DataTypes.STRING(4000),
        allowNull: false,
        field: 'unit_desc',
      },
      limitationPollutantNotes: {
        type: DataTypes.STRING(4000),
        allowNull: false,
        field: 'lim_pollutant_notes',
      },
      limitationLimitCalculationDescription: {
        type: DataTypes.STRING(4000),
        allowNull: false,
        field: 'lim_lim_calc_desc',
      },
      limitationUnitBasis: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'unit_basis',
      },
      pointSourceCategoryCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'psc_code',
      },
      pointSourceCategoryName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'psc_name',
      },
      pointSourceCategoryCfrSection: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'psc_cfr_part',
      },
      pointSourceCategoryNotes: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'psc_cfr_notes',
      },
      pointSourceSubcategoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'subcat_id',
      },
      comboSubcategory: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'combo_subcat',
      },
      pointSourceSubcategoryTitle: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'subcat_title',
      },
      pointSourceSubcategoryCfrSection: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'subcat_cfr_section',
      },
      pointSourceSubcategoryApplicability: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'subcat_applicability',
      },
      pointSourceSubcategoryNotes: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'subcat_notes',
      },
      controlTechnologyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'ct_id',
      },
      controlTechnologyCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'ct_code',
      },
      controlTechnologyDisplayOrder: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'ct_order',
      },
      controlTechnologyCfrSection: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'ct_cfr_section',
      },
      longTermAverageCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'lta_count',
      },
      treatmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'treatment_id',
      },
      treatmentCodes: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'treatment_codes',
      },
      treatmentDescription: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'treatment_description',
      },
      treatmentNames: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'treatment_names',
      },
      wastestreamProcessTreatmentTechnologyTechnicalReferenceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'wptt_tech_ref',
      },
      wastestreamProcessTreatmentTechnologySourceTitle: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'wptt_source_title',
      },
      wastestreamProcessTreatmentTechnologyNotes: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'wptt_tech_notes',
      },
    },
    {
      timestamps: false,
      schema: 'elg_search',
      tableName: 'ViewWastestreamProcessTreatmentTechnologyPollutantLimitation',
    }
  );
};
