'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.query('CREATE VIEW elg_search."ViewWastestreamProcessTreatmentTechnology" as ' +
    'select tt.treatment_id, tt.treatment_codes, tt.treatment_description, ' +
    'wp.processop_id, wp.processop_title, wp.secondary, wp.sortorder, wp.cfr_sect as wp_cfr_sect, wp.processop_description, ' +
    'wp.processop_notes, wp.lim_calc_desc, wp.alternative_requirement, wp.process_addtdetail, wp.zero_discharge as wp_zero_discharge, ' +
    'wptt.tech_ref as wptt_tech_ref, wptt.tech_notes as wptt_tech_notes, wptt.bmp_type as wptt_bmp_type, wptt.zero_discharge as wptt_zero_discharge, ' +
    'psc.psc_code, psc.psc_name, psc.cfr_part as psc_cfr_part, psc.cfr_notes as psc_cfr_notes, ' +
    'pss.subcat_id, pss.combo_subcat, pss.subcat_title, pss.subcat_cfr_section, pss.subcat_applicability, pss.subcat_notes, ' +
    "ct.ct_id, ct.ct_code, ct.ct_order, ct.ct_cfr_section, CASE WHEN ct.includesbmps = '1' THEN true ELSE false END as ct_includes_bmps " +
    'from elg_search."WastestreamProcessTreatmentTechnologyPollutant" wpttp ' +
    'inner join elg_search."WastestreamProcessTreatmentTechnology" wptt on wpttp.processop_id = wptt.processop_id and wpttp.treatment_id = wptt.treatment_id ' +
    'inner join elg_search."TreatmentTechnology" tt on wpttp.treatment_id = tt.treatment_id ' +
    'inner join elg_search."WastestreamProcess" wp on wpttp.processop_id = wp.processop_id ' +
    'inner join elg_search."ControlTechnology" ct on wp.ct_id = ct.ct_id ' +
    'inner join elg_search."PointSourceSubcategory" pss on ct.subcat_id = pss.subcat_id ' +
    'inner join elg_search."PointSourceCategory" psc on pss.psc_code = psc.psc_code and psc."IncludeInSearchTool" = true'),
  down: (queryInterface, Sequelize) => queryInterface.sequelize.query('DROP VIEW elg_search."ViewWastestreamProcessTreatmentTechnology"')
};
