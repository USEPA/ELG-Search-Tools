module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'ViewWastestreamProcessTreatmentTechnology',
    {
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
        field: 'lim_calc_desc',
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
      wastestreamProcessZeroDischarge: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'wp_zero_discharge',
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
      wastestreamProcessTreatmentTechnologyBmpType: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'wptt_bmp_type',
      },
      wastestreamProcessTreatmentTechnologyZeroDischarge: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'wptt_zero_discharge',
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
        type: DataTypes.INTEGER,
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
      controlTechnologyIncludesBmps: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'ct_includes_bmps',
      },
    },
    { timestamps: false, schema: 'elg_search', tableName: 'ViewWastestreamProcessTreatmentTechnology' }
  );
};
