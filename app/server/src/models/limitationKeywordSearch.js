module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'LimitationKeywordSearch',
    {
      limitationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'lim_id',
      },
      pointSourceSubcategoryTitle: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'subcat_title',
      },
      generalProvisionTitle: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'genprov_section_title',
      },
      generalProvisionDescription: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'genprov_desc',
      },
      pointSourceCategoryName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'psc_name',
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
      wastestreamProcessDescription: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'processop_description',
      },
      wastestreamProcessLimitCalculationDescription: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'wp_lim_calc_desc',
      },
      wastestreamProcessNotes: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'processop_notes',
      },
      limitRequirementDescription: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'alt_lim',
      },
      limitationPollutantNotes: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'lim_pollutant_notes',
      },
      ltaNotes: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'lta_notes',
      },
      elgPollutantDescription: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'elg_pollutant_description',
      },
      treatmentDescriptions: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'treatment_descriptions',
      },
      wastestreamProcessTreatmentTechnologyNotes: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'wptt_tech_notes',
      },
      treatmentNames: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'treatment_names',
      },
      pointSourceCategoryCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'psc_code',
      },
      pollutantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'pollutant_code',
      },
      wastestreamProcessId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'processop_id',
      },
      treatmentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'treatment_id',
      },
      pscVector: {
        type: DataTypes.STRING(4000),
        allowNull: false,
        field: 'psc_vector',
      },
      wpVector: {
        type: DataTypes.STRING(4000),
        allowNull: false,
        field: 'wp_vector',
      },
      pollVector: {
        type: DataTypes.STRING(4000),
        allowNull: false,
        field: 'poll_vector',
      },
      ttVector: {
        type: DataTypes.STRING(4000),
        allowNull: false,
        field: 'tt_vector',
      },
    },
    { timestamps: false, schema: 'elg_search', tableName: 'LimitationKeywordSearch' }
  );
};
