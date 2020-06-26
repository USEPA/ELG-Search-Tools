module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'GeneralProvision',
    {
      pointSourceCategoryCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'psc_code'
      },
      cfrSection: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'genprov_cfr_section'
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'genprov_section_title'
      },
      description: {
        type: DataTypes.STRING(8000),
        allowNull: false,
        field: 'genprov_desc'
      },
      isMonitoringRequirement: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'genprov_monitoring_reqs'
      },
      isBMP: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'genprov_bmps_reqs'
      },
      cfrHasAdditionalDetails: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'additional_detail_in_cfr_'
      },
      sourceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'genprov_source_id'
      }
    },
    { timestamps: false, schema: 'elg_search', tableName: 'GeneralProvision'}
  )
};
