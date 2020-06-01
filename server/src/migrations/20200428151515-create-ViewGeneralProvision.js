'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.query('CREATE VIEW elg_search."ViewGeneralProvision" as ' +
    "select ag.psc_code, pss.subcat_id as subcat_id, " +
    "case " +
    "when pss.combo_subcat is not null then pss.combo_subcat " +
    "when ag.genprov_desc not like '(Subpart %' then 'All' " +
    "end as subcategory, " +
    "pss.subcat_cfr_section, ag.genprov_cfr_section, " +
    "case when ag.genprov_section_title like '%Applicability%' then true else false end as genprov_applicability, " +
    "case when lower(ag.genprov_section_title) not like '%definitions%' then true else false end as genprov_other_provision, " +
    "ag.genprov_monitoring_reqs, ag.genprov_bmps_reqs, " +
    "case " +
    "when ag.genprov_section_title like '%Applicability%' then 'applicability' " +
    "when genprov_monitoring_reqs then 'monitoringRequirement' " +
    "when genprov_bmps_reqs then 'bmp' " +
    "when lower(ag.genprov_section_title) not like '%definitions%' then 'other' " +
    "end as genprov_type, " +
    "ag.additional_detail_in_cfr_, ag.genprov_section_title, " +
    "regexp_replace(ag.genprov_desc, '^\\(Subpart [[:alpha:]]\\) ', '') as genprov_desc " +
    'from elg_search."GeneralProvision" ag ' +
    'left outer join elg_search."PointSourceSubcategory" pss ' +
    "on ag.psc_code = pss.psc_code " +
    "and left(split_part(ag.genprov_cfr_section::text, '.'::text, 2) || case when length(split_part(ag.genprov_cfr_section::text, '.'::text, 2)) = 1 then '0' else '' end, length(split_part(ag.genprov_cfr_section::text, '.'::text, 2) || case when length(split_part(ag.genprov_cfr_section::text, '.'::text, 2)) = 1 then '0' else '' end) - 1) = " +
    "left(split_part(pss.subcat_cfr_section::text, '.'::text, 2), length(split_part(pss.subcat_cfr_section::text, '.'::text, 2)) - 1)"),
  down: (queryInterface, Sequelize) => queryInterface.sequelize.query('DROP VIEW elg_search."ViewGeneralProvision"')
};
