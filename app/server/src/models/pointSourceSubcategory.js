module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'PointSourceSubcategory',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'subcat_id',
        primaryKey: true,
      },
      pointSourceCategoryCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'psc_code',
      },
      pointSourceSubcategoryCode: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'subcat_code',
      },
      pointSourceSubcategoryTitle: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'subcat_title',
      },
      pointSourceSubcategoryCfrSection: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'subcat_cfr_section',
      },
      pointSourceSubcategoryApplicability: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'subcat_applicability',
      },
      includesBmps: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'subcat_includes_bmps',
      },
      pointSourceSubcategoryNotes: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'subcat_notes',
      },
      moreDetailFlag: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'moredetail_flag',
      },
      sourceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'source_id',
      },
      detailDescription: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'detail_desc',
      },
      comboSubcategory: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'combo_subcat',
      },
      reservedFlag: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'reservedflag',
      },
    },
    { timestamps: false, schema: 'elg_search', tableName: 'PointSourceSubcategory' }
  );
};
