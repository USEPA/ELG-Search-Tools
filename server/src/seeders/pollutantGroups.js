module.exports = {
  up(queryInterface) {
    let records = [{"id":1,"group_description":"CWA priority pollutant"},
      {"id":2,"group_description":"Nutrient (nitrogen)"},
      {"id":3,"group_description":"Nutrient (phosphorus)"},
      {"id":4,"group_description":"Conventional"},
      {"id":5,"group_description":"Solids"},
      {"id":6,"group_description":"Metals"}];

    return queryInterface.bulkInsert({ schema: "elg_search", tableName: "PollutantGroup" }, records);
  },
  down: (queryInterface) => queryInterface.bulkDelete({
    schema: "elg_search",
    tableName: "PollutantGroup"
  }, null, {})
};
