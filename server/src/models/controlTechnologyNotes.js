module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'ControlTechnologyNotes',
    {
      controlTechnologyCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'loc'
      },
      cfrSection: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'ct_cfr_section'
      },
      notes: {
        type: DataTypes.STRING(4000),
        allowNull: false,
        field: 'ct_notes'
      }
    },
    { timestamps: false, schema: 'elg_search', tableName: 'ControlTechnologyNotes' }
  );
};
