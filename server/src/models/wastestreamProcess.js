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
        allowNull: true,
        field: 'cfr_sect'
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'processop_title'
      },
      secondary: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'secondary'
      },
      description: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'processop_description'
      },
      notes: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'processop_notes'
      },
      limitCalculationDescription: {
        type: DataTypes.STRING(4000),
        allowNull: true,
        field: 'lim_calc_desc'
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
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'zero_discharge'
      },
      includesBmps: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'includes_bmps'
      },
      noLimitations: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'no_limits'
      },
      alternativeRequirement: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'alternative_requirement'
      },
      voluntaryRequirement: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'voluntary_requirement'
      },
      additionalDetail: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'process_addtdetail'
      }
    },
    { timestamps: false, schema: 'elg_search', tableName: 'WastestreamProcess' }
  );
};
