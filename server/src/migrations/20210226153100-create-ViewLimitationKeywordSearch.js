'use strict';

module.exports = {
  up: (queryInterface, ignore) => queryInterface.sequelize.query('CREATE VIEW elg_search."ViewLimitationKeywordSearch" as ' +
    'select vl.lim_Id, vl.subcat_title, gp.genprov_section_title, gp.genprov_desc, vl.psc_name, ' +
    ' wp.processop_title, wp.secondary, wp.processop_description, vl.wp_lim_calc_desc, wp.processop_notes, vl.alt_lim, ' +
    ' vl.lim_pollutant_notes, lta.notes as lta_notes, vl.elg_pollutant_description, ' +
    ' tt.treatment_descriptions, vl.wptt_tech_notes, tt.treatment_names, ' +
    ' vl.psc_code, vl.pollutant_code, vl.processop_id, vl.treatment_id ' +
    'from elg_search."ViewWastestreamProcessTreatmentTechnologyPollutantLimitation" vl ' +
    ' left outer join elg_search."GeneralProvision" gp on vl.psc_code = gp.psc_code ' +
    ' inner join elg_search."WastestreamProcess" wp on vl.processop_id = wp.processop_id ' +
    ' left outer join elg_search."LongTermAverage" lta on vl.lim_id = lta.lim_id ' +
    ' left outer join elg_search."TreatmentTechnology" tt on vl.treatment_id = tt.treatment_id'),
  down: (queryInterface, ignore) => queryInterface.sequelize.query('DROP VIEW elg_search."ViewLimitationKeywordSearch"')
};
