'use strict';

module.exports = {
  up: (queryInterface, ignore) => queryInterface.sequelize.query('CREATE VIEW elg_search."ViewLimitation" as ' +
    'select l.lim_id, l.discharge_frequency, l.lim_value, l.typo_flag_lim_value, l.lim_value_min, l.lim_value_max, l.alt_lim_flag, l.alt_lim, l.alt_lim_description, ' +
    "CASE WHEN l.zero_discharge = '1' THEN true ELSE false END as zero_discharge, " +
    'wp.processop_id, wp.processop_title, wp.secondary, wp.sortorder, wp.cfr_sect as wp_cfr_sect, ' +
    'wp.processop_description, wp.processop_notes, wp.lim_calc_desc as wp_lim_calc_desc, wp.typo_flag_lim_calc_description as wp_typo_flag_lim_calc_description, ' +
    'wp.alternative_requirement, wp.voluntary_requirement, wp.process_addtdetail, ' +
    'p.pollutant_code, p.pollutant_desc, p.elg_pollutant_description, ld.limit_duration_code, ' +
    "ld.limit_duration_description || CASE WHEN l.discharge_frequency IS NOT NULL THEN ' (' || l.discharge_frequency || ')' ELSE '' END as limit_duration_description, " +
    "ld.stat_base_type, ld.limit_type_display, lu.unit_code, lu.unit, lu.unit_desc, lu.unit_basis, " +
    'l.lim_calc_desc as lim_lim_calc_desc, l.pollutant_notes as lim_pollutant_notes, ' +
    'psc.psc_code, psc.psc_name, psc.cfr_part as psc_cfr_part, psc.cfr_notes as psc_cfr_notes, psc.link_url as psc_link_url, ' +
    'pss.subcat_id, pss.combo_subcat, pss.subcat_title, pss.subcat_cfr_section, pss.subcat_applicability, pss.subcat_notes, ' +
    'ct.ct_id, ct.ct_code, ct.ct_order, ct.ct_cfr_section, ' +
    'tt.treatment_id, tt.treatment_codes, tt.treatment_description, tt.treatment_names, ' +
    'count(lta.ltaid) as lta_count ' +
    'from elg_search."Limitation" l inner join elg_search."LimitationDuration" ld on l.lim_duration_code = ld.limit_duration_code ' +
    'left outer join elg_search."LimitationUnit" lu on l.unit_code = lu.unit_code ' +
    'inner join elg_search."Pollutant" p on l.pollutant_code = p.pollutant_code ' +
    'inner join elg_search."WastestreamProcess" wp on l.processop_id = wp.processop_id ' +
    'inner join elg_search."ControlTechnology" ct on wp.ct_id = ct.ct_id ' +
    'inner join elg_search."PointSourceSubcategory" pss on ct.subcat_id = pss.subcat_id ' +
    'inner join elg_search."PointSourceCategory" psc on pss.psc_code = psc.psc_code and psc."IncludeInSearchTool" = true ' +
    'left outer join elg_search."TreatmentTechnology" tt on l.treatment_id = tt.treatment_id ' +
    'left outer join elg_search."LongTermAverage" lta on l.lim_id = lta.lim_id ' +
    'group by l.lim_id, l.discharge_frequency, l.lim_value, l.lim_value_min, l.lim_value_max, l.alt_lim_flag, l.alt_lim, l.alt_lim_description, ' +
    "CASE WHEN l.zero_discharge = '1' THEN true ELSE false END, " +
    'wp.processop_id, wp.processop_title, wp.secondary, wp.sortorder, wp.cfr_sect, ' +
    'wp.processop_description, wp.processop_notes, wp.lim_calc_desc, wp.alternative_requirement, wp.process_addtdetail, ' +
    'p.pollutant_code, p.pollutant_desc, p.elg_pollutant_description, ' +
    'ld.limit_duration_code, ld.limit_duration_description, ld.stat_base_type, ld.limit_type_display, ' +
    'lu.unit_code, lu.unit, lu.unit_desc, lu.unit_basis, ' +
    'l.lim_calc_desc, l.pollutant_notes, ' +
    'psc.psc_code, psc.psc_name, psc.cfr_part, psc.cfr_notes, ' +
    'pss.subcat_id, pss.combo_subcat, pss.subcat_title, pss.subcat_cfr_section, pss.subcat_applicability, pss.subcat_notes, ' +
    'ct.ct_id, ct.ct_code, ct.ct_order, ct.ct_cfr_section, ' +
    'tt.treatment_id, tt.treatment_codes, tt.treatment_description, tt.treatment_names '
  ),
  down: (queryInterface, ignore) => queryInterface.sequelize.query('DROP VIEW elg_search."ViewLimitation"')
};
