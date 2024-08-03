'use strict';

module.exports = {
  up: (queryInterface) =>
    queryInterface.sequelize.query(
      'CREATE VIEW elg_search."ViewLimitationRange" as ' +
        'select lr.lim_id, lr.alt_lim_flag, lr.display_value, lr.display_min, lr.display_max, lr.display_units, ' +
        'vl.pollutant_desc, vl.limit_type_display ' +
        'from elg_search."LimitationRange" lr inner join elg_search."ViewLimitation" vl on lr.lim_id = vl.lim_id'
    ),
  down: (queryInterface) => queryInterface.sequelize.query('DROP VIEW elg_search."ViewLimitationRange"'),
};
