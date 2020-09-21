'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.query('CREATE VIEW elg_search."ViewDefinition" as ' +
    "select ad.cfr_part as psc_code, pss.subcat_id as subcat_id, " +
    "case when pss.combo_subcat is not null then pss.combo_subcat else 'General Definitions' end as subcategory, " +
    "ad.subcat_cfr_section, ad.cfr_subsection, ad.additional_detail_cfr_flag, " +
    "ad.term, regexp_replace(ad.definition, '^\\(Subpart [[:alpha:]]*\\) ', '') as definition " +
    'from elg_search."Definition" ad ' +
    'left outer join elg_search."PointSourceSubcategory" pss ' +
    "on (ad.subcat_cfr_section is not null and ad.subcat_cfr_section = pss.subcat_cfr_section) " +
    "or (ad.subcat_cfr_section is null and split_part(ad.cfr_subsection, '.', 1) = split_part(pss.subcat_cfr_section , '.', 1) " +
    "and left(split_part(ad.cfr_subsection, '.', 2), length(split_part(ad.cfr_subsection, '.', 2)) - 1) = left(split_part(pss.subcat_cfr_section , '.', 2), length(split_part(pss.subcat_cfr_section, '.', 2)) - 1))"),
  down: (queryInterface, Sequelize) => queryInterface.sequelize.query('DROP VIEW elg_search."ViewDefinition"')
};
