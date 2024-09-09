module.exports = {
  up(queryInterface) {
    return queryInterface.sequelize.query('reindex schema elg_search');
  },
  //down: (queryInterface) => {}
};
