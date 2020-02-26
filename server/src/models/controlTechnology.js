module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'ControlTechnology',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'ct_id',
        primaryKey: true
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
      },
      displayOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'ct_order'
      },
      cfrSection: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'ct_cfr_section'
      },
      notes: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'ct_notes'
      },
      sourceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'source_id'
      },
      reservedFlag: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'reservedflag'
      },
      qcFlag: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'qc_flag'
      },
      qcNotes: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'qc_notes'
      },
      includesBmps: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'includesbmps'
      }
    },
    { timestamps: false, schema: 'elg_search', tableName: 'ControlTechnology'}
  )
};
