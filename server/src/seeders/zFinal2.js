module.exports = {
  up(queryInterface) {
    return queryInterface.sequelize.query('reindex database elg_search');
  },
  //down: (queryInterface) => {}
};
