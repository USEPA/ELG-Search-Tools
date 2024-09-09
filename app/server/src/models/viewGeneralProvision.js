module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'ViewGeneralProvision',
    {
      pointSourceCategoryCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'psc_code',
      },
      subcategoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'subcat_id',
      },
      cfrSection: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'genprov_cfr_section',
      },
      subcategory: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'subcategory',
      },
      subcategoryCfrSection: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'subcat_cfr_section',
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'genprov_section_title',
      },
      description: {
        type: DataTypes.STRING(8000),
        allowNull: false,
        field: 'genprov_desc',
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'genprov_type',
      },
      isApplicability: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'genprov_applicability',
      },
      isMonitoringRequirement: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'genprov_monitoring_reqs',
      },
      isBMP: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'genprov_bmps_reqs',
      },
      isOther: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'genprov_other_provision',
      },
      cfrHasAdditionalDetails: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'additional_detail_in_cfr_',
      },
      sourceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'genprov_source_id',
      },
    },
    { timestamps: false, schema: 'elg_search', tableName: 'ViewGeneralProvision' }
  );
};
