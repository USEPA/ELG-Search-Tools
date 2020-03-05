'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.query('CREATE VIEW elg_search."ViewLongTermAverage" as ' +
    'select lta.lta_value, lu.unit as lta_unit, lu.unit_desc as lta_unit_desc, lu.unit_basis as lta_unit_basis, ' +
    'lta.notes as lta_notes, lta.tech_ref as lta_tech_ref, rs.source_title as lta_source_title, tt.treatment_codes, ' +
    'l.lim_id, l.discharge_frequency, l.lim_value, l.lim_value_min, l.lim_value_max, l.alt_lim_flag, l.alt_lim, ' +
    "CASE WHEN l.zero_discharge = '1' THEN true ELSE false END as zero_discharge, " +
    'wp.processop_id, wp.processop_title, wp.secondary, wp.sortorder, wp.cfr_sect as wp_cfr_sect, ' +
    'wp.processop_description, wp.processop_notes, wp.lim_calc_desc, wp.alternative_requirement, wp.process_addtdetail, ' +
    'p.pollutant_code, p.pollutant_desc, ' +
    'ld.limit_duration_code, ld.limit_duration_description, ld.stat_base_type, ' +
    'lu.unit_code, lu.unit, lu.unit_desc, lu.unit_basis, ' +
    'psc.psc_code, psc.psc_name, psc.cfr_part as psc_cfr_part, psc.cfr_notes as psc_cfr_notes, ' +
    'pss.subcat_id, pss.combo_subcat, pss.subcat_title, pss.subcat_cfr_section, pss.subcat_applicability, pss.subcat_notes, ' +
    'ct.ct_id, ct.ct_code, ct.ct_order, ct.ct_cfr_section ' +
    'from elg_search."Limitation" l inner join elg_search."LimitationDuration" ld on l.lim_duration_code = ld.limit_duration_code ' +
    'left outer join elg_search."LimitationUnit" lu on l.unit_code = lu.unit_code ' +
    'inner join elg_search."Pollutant" p on l.pollutant_code = p.pollutant_code ' +
    'inner join elg_search."WastestreamProcess" wp on l.processop_id = wp.processop_id ' +
    'inner join elg_search."ControlTechnology" ct on wp.ct_id = ct.ct_id ' +
    'inner join elg_search."PointSourceSubcategory" pss on ct.subcat_id = pss.subcat_id ' +
    'inner join elg_search."PointSourceCategory" psc on pss.psc_code = psc.psc_code and psc."IncludeInSearchTool" = true ' +
    'inner join elg_search."LongTermAverage" lta on l.lim_id = lta.lim_id ' +
    'inner join elg_search."LimitationDuration" ld_lta on lta.lim_duration_code = ld_lta.limit_duration_code ' +
    'inner join elg_search."LimitationUnit" lu_lta on lta.lta_units = lu_lta.unit_code ' +
    'inner join elg_search."TreatmentTechnology" tt on lta.treatment_id = tt.treatment_id ' +
    'inner join elg_search."ReferenceSource" rs on lta.tech_ref = rs.source_id'),
  down: (queryInterface, Sequelize) => queryInterface.sequelize.query('DROP VIEW elg_search."ViewLongTermAverage"')
};
