module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'WastestreamProcess',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'processop_id',
        primaryKey: true
      },
      controlTechnologyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'ct_id'
      },
      cfrSection: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'cfr_sect'
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'processop_title'
      },
      secondary: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'secondary'
      },
      description: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'processop_description'
      },
      displayOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'sortorder'
      },
      sourceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'source_id'
      },
      zeroDischarge: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'zero_discharge'
      },
      includesBmps: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'includes_bmps'
      },
      noLimitations: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'no_limits'
      }
    },
    { timestamps: false, schema: 'elg_search', tableName: 'WastestreamProcess' }
  );
};
