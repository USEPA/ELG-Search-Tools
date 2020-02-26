'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.query('CREATE VIEW elg_search."ViewLimitation" as ' +
    'select l.lim_id, l.processop_id, wp.processop_title, wp.secondary, wp.sortorder, l.pollutant_code, p.pollutant_desc, ' +
    'l.lim_duration_code, ld.limit_duration_description, l.discharge_frequency, l.lim_value, l.unit_code, lu.unit, ' +
    'l.lim_value_min, l.lim_value_max, l.zero_discharge, psc.psc_code, psc.psc_name, pss.subcat_id, pss.combo_subcat, ct.ct_code ' +
    'from elg_search."Limitation" l inner join elg_search."LimitationDuration" ld on l.lim_duration_code = ld.limit_duration_code ' +
    'left outer join elg_search."LimitationUnit" lu on l.unit_code = lu.unit_code ' +
    'inner join elg_search."Pollutant" p on l.pollutant_code = p.pollutant_code ' +
    'inner join elg_search."WastestreamProcess" wp on l.processop_id = wp.processop_id ' +
    'inner join elg_search."ControlTechnology" ct on wp.ct_id = ct.ct_id ' +
    'inner join elg_search."PointSourceSubcategory" pss on ct.subcat_id = pss.subcat_id ' +
    'inner join elg_search."PointSourceCategory" psc on pss.psc_code = psc.psc_code and psc."IncludeInSearchTool" = true'),
  down: (queryInterface, Sequelize) => queryInterface.sequelize.query('DROP VIEW elg_search."ViewLimitation"')
};
