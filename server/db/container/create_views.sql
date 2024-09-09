--create views for tables formatting needs
CREATE VIEW elg_database.view_n2_subcategory AS
SELECT
    psc_code,
    subcat_id,
    subcat_title,
    subcat_code,
    subcat_cfr_section,
    subcat_applicability,
    subcat_includes_bmps,
    subcat_notes,
    moredetail_flag,
    source_id,
    detail_desc,
    combo_subcat,
    reservedflag
FROM
    elg_database.n2_subcategory;

CREATE VIEW elg_database.view_n3a_control_technology_notes AS
SELECT
    loc,
    ct_cfr_section,
    regexp_replace(regexp_replace(ct_notes, chr(147), '"', 'g'), chr(148), '"', 'g') AS ct_notes,
    CASE WHEN loc_display = '1' THEN
        TRUE
    ELSE
        FALSE
    END AS loc_display,
    typo_flag_ct_notes
FROM
    elg_database.n3a_control_technology_notes;

CREATE VIEW elg_database.view_n4_wastestream_process AS
SELECT
    processop_id,
    ct_id,
    processop_title,
    cfr_sect,
    TRIM(COALESCE(processop_constraint1, '') || ' ' || COALESCE('<strong><u>' || processop_andor1 || '</u></strong>', '') || ' ' || COALESCE(processop_constraint2, '') || ' ' || COALESCE('<strong><u>' || processop_andor2 || '</u></strong>', '') || ' ' || COALESCE(processop_constraint3, '') || ' ' || COALESCE('<strong><u>' || processop_andor3 || '</u></strong>', '') || ' ' || COALESCE(processop_constraint4, '')) AS secondary,
    regexp_replace(regexp_replace(processop_description, chr(145), '''', 'g'), chr(146), '''', 'g') AS processop_description,
    CASE WHEN processop_id = 25055 THEN
        'Limitations for the parameters are the same as the corresponding limitation specified in \u00A7437.42(e)' --odd character in source data
    ELSE
        pl.lim_calc_desc
    END AS lim_calc_desc,
    processop_notes,
    CASE WHEN zero_discharge = '1' THEN
        TRUE
    ELSE
        FALSE
    END AS zero_discharge,
    CASE WHEN no_limits = '1' THEN
        TRUE
    ELSE
        FALSE
    END AS no_limits,
    CASE WHEN includes_bmps = '1' THEN
        TRUE
    ELSE
        FALSE
    END AS includes_bmps,
    source_id,
    sortorder,
    CASE WHEN alternative_req = '1' THEN
        TRUE
    ELSE
        FALSE
    END AS alternative_requirement,
    CASE WHEN voluntary_req = '1' THEN
        TRUE
    ELSE
        FALSE
    END AS voluntary_requirement,
    CASE WHEN process_addtdetail = '1' THEN
        TRUE
    ELSE
        FALSE
    END AS process_addtdetail,
    typo_flag_lim_calc_description,
    typo_flag_po_notes
FROM
    elg_database.n4_wastestream_process pl;

CREATE VIEW elg_database.view_n5_pollutant_limitations AS
SELECT
    pl.processop_id,
    pl.lim_id,
    pl.pollutant_code,
    CASE WHEN pl.lim_id = 70840 THEN
        '0.17 + (8 X (no. of hides)/kg RM)'
    WHEN pl.lim_id = 70841 THEN
        '0.21 + (11 X (no. of hides)/kg RM)'
    WHEN pl.lim_id = 70843 THEN
        '0.34 + (8 X (no. of hides)/kg RM)'
    WHEN pl.lim_id = 70844 THEN
        '0.42 + (11 X (no. of hides)/kg RM)'
    WHEN pl.lim_id = 70869 THEN
        '0.09 + (3.6 X (no. of hides)/kg RM)'
    WHEN pl.lim_id = 70870 THEN
        '0.11 + (6.2 X (no. of hides)/kg RM)'
    WHEN pl.lim_id = 70871 THEN
        '0.18 + (3.6 X (no. of hides)/kg RM)'
    WHEN pl.lim_id = 70872 THEN
        '0.22 + (6.2 X (no. of hides)/kg RM)'
    WHEN pl.lim_id = 70885 THEN
        '0.09 + (3.6 X (no. of hides)/kg RM)'
    WHEN pl.lim_id = 70886 THEN
        '0.18 + (3.6 X (no. of hides)/kg RM)'
    WHEN pl.lim_id = 70887 THEN
        '0.11 + (6.2 X (no. of hides)/kg RM)'
    WHEN pl.lim_id = 70888 THEN
        '0.22 + (6.2 X (no. of hides)/kg RM)'
    ELSE
        pl.lim_value
    END AS lim_value, --TODO: check these values in the latest data!
    pl.lim_value_min,
    pl.lim_value_max,
    pl.alt_lim_flag,
    CASE WHEN pl.lim_id = 6799 THEN
        'As referenced in 423.16(e)' --odd character in source data
    WHEN pl.lim_id = 52831 THEN
        'Stock Limitations (C16-C18 internal olefin). PAH mass ratio shall not exceed 1 X 10-5. PAH mass ratio = Mass (g) of PAH (as phenanthrene)/Mass (g) of stock base fluid as determined by EPA Method 1654, Revision A, [specified at \u00A7435.11(u)] entitled "PAH Content of Oil by HPLC/UV," December 1992, which is published as an appendix to subpart A of this part and in "Analytic Methods for the Oil and Gas Extraction Point Source Category," EPA-821-R-11-004. See \u00A7435.11(uu).'
    WHEN pl.lim_id = 52867 THEN
        'Stock Limitations (C16-C18 internal olefin). PAH mass ratio shall not exceed 1 X 10-5. PAH mass ratio = Mass (g) of PAH (as phenanthrene)/Mass (g) of stock base fluid as determined by EPA Method 1654, Revision A, [specified at \u00A7435.11(u)] entitled "PAH Content of Oil by HPLC/UV," December 1992, which is published as an appendix to subpart A of this part and in "Analytic Methods for the Oil and Gas Extraction Point Source Category," EPA-821-R-11-004. See \u00A7435.11(uu).'
    ELSE
        pl.alt_lim
    END AS alt_lim, --TODO: check these values in the latest data!
    pl.lim_duration_code,
    pl.discharge_frequency,
    pl.unit_code,
    pl.analytical_method_id,
    pl.wf_id,
    pl.fn_id,
    pl.question_desc,
    pl.mdl,
    pl.ml,
    lim_calc_desc,
    pl.source_id,
    pl.qc_flag,
    pl.qc_notes,
    pl.zero_discharge,
    CASE WHEN pl.lim_id = 70840 THEN
        'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.17 + 17.6 X (no. of hides)/lbs RM).'
    WHEN pl.lim_id = 70841 THEN
        'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.21 + 24.2 X (no. of hides)/lbs RM).'
    WHEN pl.lim_id = 70843 THEN
        'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.34 + 17.6 X (no. of hides)/lbs RM).'
    WHEN pl.lim_id = 70844 THEN
        'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.42 + 24.2 X (no. of hides)/lbs RM).'
    WHEN pl.lim_id = 70869 THEN
        'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.09 + 7.9 X (no. of hides)/lbs RM).'
    WHEN pl.lim_id = 70870 THEN
        'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.11 + 13.6 X (no. of hides)/lbs RM).'
    WHEN pl.lim_id = 70871 THEN
        'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.18 + 7.9 X (no. of hides)/lbs RM).'
    WHEN pl.lim_id = 70872 THEN
        'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.22 + 13.6 X (no. of hides)/lbs RM).'
    WHEN pl.lim_id = 70885 THEN
        'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.09 + 17.6 X (no. of hides)/lbs RM).'
    WHEN pl.lim_id = 70886 THEN
        'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.18 + 17.6 X (no. of hides)/lbs RM).'
    WHEN pl.lim_id = 70887 THEN
        'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.11 + 24.2 X (no. of hides)/lbs RM).'
    WHEN pl.lim_id = 70888 THEN
        'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.22 + 24.2 X (no. of hides)/lbs RM).'
    ELSE
        regexp_replace(regexp_replace(regexp_replace(pl.pollutant_notes, chr(147), '"', 'g'), chr(148), '"', 'g'), 'ï¿½', 'u', 'g')
    END AS pollutant_notes, --TODO: check these values in the latest data!
    pl.dataentry_psc_code,
    pl.qc_initials,
    pl.treatment_id,
    alf.description AS alt_lim_description,
    pl.typo_flag_lim_value
FROM
    elg_database.n5_pollutant_limitations pl
    LEFT OUTER JOIN elg_database.key_alt_lim_flag alf ON pl.alt_lim_flag = alf.flag;

CREATE VIEW elg_database.view_key_ttcodes AS
SELECT
    "name",
    code,
    category,
    variations,
    regexp_replace(regexp_replace(regexp_replace(description, chr(150), '-', 'g'), chr(147), '"', 'g'), chr(148), '"', 'g') AS description
FROM
    elg_database.key_ttcodes;

CREATE VIEW elg_database.view_a_cfr_citation_history AS
SELECT
    source_id,
    psc,
    cfr_section,
    subcategory,
    cfr_section_description,
    publication_date,
    frn__in_cfr_,
    frn__1st_page_,
    notes
FROM
    elg_database.a_cfr_citation_history;

CREATE VIEW elg_database.view_a_definition AS
SELECT
    cfr_part,
    def_id,
    subcat_cfr_section,
    cfr_subsection,
    term,
    CASE WHEN cfr_part = 427
        AND cfr_subsection = '427.71.c'
        AND term = 'Pieces' THEN
        '(Subpart G) Floor tile measured in the standard size of 12" X 12" X 3/32".'
    WHEN cfr_part = 420
        AND cfr_subsection = '420.21.d'
        AND term = 'pg/L' THEN
        '(Subpart B) Picograms per liter (ppt = 1.0 X 10-12 gm/L).'
    ELSE
        definition
    END AS definition,
    deftype,
    CASE WHEN additional_detail_cfr_flag = '1' THEN
        TRUE
    ELSE
        FALSE
    END AS additional_detail_cfr_flag,
    source_id,
    qc_flag,
    qc_notes,
    typo_flag_definition
FROM
    elg_database.a_definition;

CREATE VIEW elg_database.view_a_generalprovisions AS
SELECT
    psc_code,
    genprov_cfr_section,
    genprov_section_title,
    CASE WHEN psc_code = 469
        AND genprov_cfr_section = '469.13'
        AND genprov_section_title = 'Monitoring' THEN
        '(Subpart A) (a) In lieu of monitoring for TTO, the permitting authority may allow direct dischargers to include the following certification as a comment on the Discharge Monitoring Report required by §122.44 (i), formerly §122.62(i): Based on my  inquiry of the person or persons directly responsible for managing compliance with the permit limitation for total toxic organics (TTO), I certify that, to the best of my knowledge and belief, no dumping of concentrated toxic organics into the wastewaters has occurred since filing the last discharge monitoring report. I further certify that this facility is implementing the solvent management plan submitted to the permitting authority. (b) In requesting that no monitoring of TTO be required, the direct discharger shall submit a solvent management plan that specifies to the permitting authority''s satisfaction the toxic organic compounds used; the method of disposal used instead of dumping, such as reclamation, contract hauling, or incineration; and procedures for assuring that toxic organics do not routinely spill or leak into the wastewater. The permitting authority shall incorporate the plan as a provision of the permit. (c) In lieu of monitoring for TTO, the control authority may allow industrial users of POTWs to make the following certification as a comment to the periodic reports required by §403.12: Based on my inquiry of the person or persons directly responsible for managing compliance with the pretreatment standard for total toxic organics (TTO), I certify that, to the best of my knowledge and belief, no dumping of concentrated toxic organics into the wastewaters has occurred since filing the last discharge monitoring report. I further certify that this facility is implementing the solvent management plan submitted to the control authority. (d) In requesting that no monitoring be required, industrial users of POTWs shall submit a solvent management plan that specifies to the control authority''s satisfaction the toxic organic compounds used; the method of disposal used instead of dumping, such as reclamation, contract hauling, or incineration; and procedures for assuring that toxic organics do not routinely spill or leak into the wastewater.'
    ELSE
        genprov_desc
    END AS genprov_desc,
    CASE WHEN genprov_monitoring_reqs = '1' THEN
        TRUE
    ELSE
        FALSE
    END AS genprov_monitoring_reqs,
    CASE WHEN genprov_bmps_reqs = '1' THEN
        TRUE
    ELSE
        FALSE
    END AS genprov_bmps_reqs,
    genprov_source_id,
    CASE WHEN additional_detail_in_cfr_ = '1' THEN
        TRUE
    ELSE
        FALSE
    END AS additional_detail_in_cfr_
FROM
    elg_database.a_generalprovisions;

CREATE VIEW elg_database.view_a_source_new AS
SELECT
    source_id,
    sourcetype_desc,
    psc_code,
    source_link,
    source_rule_stage,
    source_citation,
    source_pub_date,
    source_eff_date,
    regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(regexp_replace(source_summary, chr(145), '''', 'g'), chr(146), '''', 'g'), chr(147), '"', 'g'), chr(148), '"', 'g'), chr(150), '-', 'g'), chr(151), '-', 'g') AS source_summary,
    regexp_replace(regexp_replace(source_docket, chr(150), '-', 'g'), chr(151), '-', 'g') AS source_docket,
    regexp_replace(regexp_replace(source_title, chr(150), '-', 'g'), chr(151), '-', 'g') AS source_title,
    regexp_replace(regexp_replace(display_title, chr(150), '-', 'g'), chr(151), '-', 'g') AS display_title,
    source_notes,
    fr_revision_type,
    regexp_replace(regexp_replace(rin, chr(150), '-', 'g'), chr(151), '-', 'g') AS rin,
    substantial_update_
FROM
    elg_database.a_source_new;

CREATE VIEW elg_database.view_n4c_technology_bases_ws AS
SELECT
    processop_id,
    treatment_id,
    tech_ref,
    regexp_replace(regexp_replace(regexp_replace(regexp_replace(tech_notes, chr(147), '"', 'g'), chr(148), '"', 'g'), chr(150), '-', 'g'), chr(151), '-', 'g') AS tech_notes,
    bmp_type,
    CASE WHEN zero_discharge = '1' THEN
        TRUE
    ELSE
        FALSE
    END AS zero_discharge
FROM
    elg_database.n4c_technology_bases_ws;

CREATE VIEW elg_database.view_ref_limit_units AS
SELECT
    unit_code,
    unit,
    regexp_replace(regexp_replace(unit_desc, chr(147), '"', 'g'), chr(148), '"', 'g') AS unit_desc,
    unit_basis
FROM
    elg_database.ref_limit_units;

CREATE VIEW elg_database.view_ref_pollutant AS
SELECT
    p.pollutant_code,
    p.pollutant_desc,
    coalesce(p.elg_pollutant_description, p.pollutant_desc) AS elg_pollutant_description,
    regexp_replace(pg.pollutant_group, ' ', '', 'g') AS pollutant_groups
FROM
    elg_database.ref_pollutant p
    LEFT OUTER JOIN elg_database.n5d_pollutant_groups pg ON p.pollutant_code = pg.pollutant_code;

CREATE VIEW elg_database.view_ref_sic_code AS
SELECT
    sic,
    regexp_replace(regexp_replace(sic_desc, chr(145), '''', 'g'), chr(146), '''', 'g') AS sic_desc,
    nullif (regexp_replace(sic, '[^0-9]', '', 'g'), '') AS sic_code FROM elg_database.ref_sic_code;

CREATE VIEW elg_database.view_ref_naics_code AS
SELECT
    naics,
    naics_desc,
    nullif (regexp_replace(naics, '[^0-9]', '', 'g'), '') AS naics_code FROM elg_database.ref_naics_code;

CREATE VIEW elg_database.view_ref_psc_sic_xwalk AS
SELECT
    sic,
    general_psc_code,
    specific_psc_code,
    nullif (regexp_replace(sic, '[^0-9]', '', 'g'), '') AS sic_code FROM elg_database.ref_psc_sic_xwalk x
        WHERE
            EXISTS (
                SELECT
                    psc_code
                FROM elg_database.n1_cfr c
                WHERE
                    c.psc_code = x.general_psc_code);

CREATE VIEW elg_database.view_ref_psc_naics_xwalk AS
SELECT
    naics,
    psc_code,
    nullif (regexp_replace(naics, '[^0-9]', '', 'g'), '') AS naics_code FROM elg_database.ref_psc_naics_xwalk x
        WHERE
            EXISTS (
                SELECT
                    psc_code
                FROM elg_database.n1_cfr c
                WHERE
                    c.psc_code = x.psc_code);

CREATE TABLE elg_database.n1_cfr_url AS
SELECT
    405 AS psc_code,
    'https://www.epa.gov/eg/dairy-products-processing-effluent-guidelines' AS link_url
UNION ALL
SELECT
    406 AS psc_code,
    'https://www.epa.gov/eg/grain-mills-effluent-guidelines' AS link_url
UNION ALL
SELECT
    408 AS psc_code,
    'https://www.epa.gov/eg/seafood-processing-effluent-guidelines' AS link_url
UNION ALL
SELECT
    410 AS psc_code,
    'https://www.epa.gov/eg/textile-mills-effluent-guidelines' AS link_url
UNION ALL
SELECT
    411 AS psc_code,
    'https://www.epa.gov/eg/cement-manufacturing-effluent-guidelines' AS link_url
UNION ALL
SELECT
    412 AS psc_code,
    'https://www.epa.gov/npdes/animal-feeding-operations-afos#regulations' AS link_url
UNION ALL
SELECT
    413 AS psc_code,
    'https://www.epa.gov/eg/electroplating-effluent-guidelines' AS link_url
UNION ALL
SELECT
    414 AS psc_code,
    'https://www.epa.gov/eg/organic-chemicals-plastics-and-synthetic-fibers-effluent-guidelines' AS link_url
UNION ALL
SELECT
    417 AS psc_code,
    'https://www.epa.gov/eg/soap-and-detergent-manufacturing-effluent-guidelines' AS link_url
UNION ALL
SELECT
    418 AS psc_code,
    'https://www.epa.gov/eg/fertilizer-manufacturing-effluent-guidelines' AS link_url
UNION ALL
SELECT
    419 AS psc_code,
    'https://www.epa.gov/eg/petroleum-refining-effluent-guidelines' AS link_url
UNION ALL
SELECT
    420 AS psc_code,
    'https://www.epa.gov/eg/iron-and-steel-manufacturing-effluent-guidelines' AS link_url
UNION ALL
SELECT
    421 AS psc_code,
    'https://www.epa.gov/eg/nonferrous-metals-manufacturing-effluent-guidelines' AS link_url
UNION ALL
SELECT
    423 AS psc_code,
    'https://www.epa.gov/eg/steam-electric-power-generating-effluent-guidelines' AS link_url
UNION ALL
SELECT
    424 AS psc_code,
    'https://www.epa.gov/eg/ferroalloy-manufacturing-effluent-guidelines' AS link_url
UNION ALL
SELECT
    425 AS psc_code,
    'https://www.epa.gov/eg/leather-tanning-and-finishing-effluent-guidelines' AS link_url
UNION ALL
SELECT
    426 AS psc_code,
    'https://www.epa.gov/eg/glass-manufacturing-effluent-guidelines' AS link_url
UNION ALL
SELECT
    429 AS psc_code,
    'https://www.epa.gov/eg/timber-products-processing-effluent-guidelines' AS link_url
UNION ALL
SELECT
    430 AS psc_code,
    'https://www.epa.gov/eg/pulp-paper-and-paperboard-effluent-guidelines' AS link_url
UNION ALL
SELECT
    432 AS psc_code,
    'https://www.epa.gov/eg/meat-and-poultry-products-effluent-guidelines' AS link_url
UNION ALL
SELECT
    433 AS psc_code,
    'https://www.epa.gov/eg/metal-finishing-effluent-guidelines' AS link_url
UNION ALL
SELECT
    434 AS psc_code,
    'https://www.epa.gov/eg/coal-mining-effluent-guidelines' AS link_url
UNION ALL
SELECT
    435 AS psc_code,
    'https://www.epa.gov/eg/oil-and-gas-extraction-effluent-guidelines' AS link_url
UNION ALL
SELECT
    436 AS psc_code,
    'https://www.epa.gov/eg/mineral-mining-and-processing-effluent-guidelines' AS link_url
UNION ALL
SELECT
    437 AS psc_code,
    'https://www.epa.gov/eg/centralized-waste-treatment-effluent-guidelines' AS link_url
UNION ALL
SELECT
    438 AS psc_code,
    'https://www.epa.gov/eg/metal-products-and-machinery-effluent-guidelines' AS link_url
UNION ALL
SELECT
    439 AS psc_code,
    'https://www.epa.gov/eg/pharmaceutical-manufacturing-effluent-guidelines' AS link_url
UNION ALL
SELECT
    440 AS psc_code,
    'https://www.epa.gov/eg/ore-mining-and-dressing-effluent-guidelines' AS link_url
UNION ALL
SELECT
    441 AS psc_code,
    'https://www.epa.gov/eg/dental-effluent-guidelines' AS link_url
UNION ALL
SELECT
    442 AS psc_code,
    'https://www.epa.gov/eg/transportation-equipment-cleaning-effluent-guidelines' AS link_url
UNION ALL
SELECT
    443 AS psc_code,
    'https://www.epa.gov/eg/paving-and-roofing-materials-effluent-guidelines' AS link_url
UNION ALL
SELECT
    444 AS psc_code,
    'https://www.epa.gov/eg/waste-combustors-effluent-guidelines' AS link_url
UNION ALL
SELECT
    445 AS psc_code,
    'https://www.epa.gov/eg/landfills-effluent-guidelines' AS link_url
UNION ALL
SELECT
    446 AS psc_code,
    'https://www.epa.gov/eg/paint-formulating-effluent-guidelines' AS link_url
UNION ALL
SELECT
    447 AS psc_code,
    'https://www.epa.gov/eg/ink-formulating-effluent-guidelines' AS link_url
UNION ALL
SELECT
    449 AS psc_code,
    'https://www.epa.gov/eg/airport-deicing-effluent-guidelines' AS link_url
UNION ALL
SELECT
    450 AS psc_code,
    'https://www.epa.gov/eg/construction-and-development-effluent-guidelines' AS link_url
UNION ALL
SELECT
    451 AS psc_code,
    'https://www.epa.gov/eg/concentrated-aquatic-animal-production-effluent-guidelines' AS link_url
UNION ALL
SELECT
    454 AS psc_code,
    'https://www.epa.gov/eg/gum-and-wood-chemicals-manufacturing-effluent-guidelines' AS link_url
UNION ALL
SELECT
    455 AS psc_code,
    'https://www.epa.gov/eg/pesticide-chemicals-effluent-guidelines' AS link_url
UNION ALL
SELECT
    457 AS psc_code,
    'https://www.epa.gov/eg/explosives-manufacturing-effluent-guidelines' AS link_url
UNION ALL
SELECT
    458 AS psc_code,
    'https://www.epa.gov/eg/carbon-black-manufacturing-effluent-guidelines' AS link_url
UNION ALL
SELECT
    459 AS psc_code,
    'https://www.epa.gov/eg/photographic-processing-effluent-guidelines' AS link_url
UNION ALL
SELECT
    461 AS psc_code,
    'https://www.epa.gov/eg/battery-manufacturing-effluent-guidelines' AS link_url
UNION ALL
SELECT
    463 AS psc_code,
    'https://www.epa.gov/eg/plastics-molding-and-forming-effluent-guidelines' AS link_url
UNION ALL
SELECT
    464 AS psc_code,
    'https://www.epa.gov/eg/metal-molding-and-casting-foundries-effluent-guidelines' AS link_url
UNION ALL
SELECT
    465 AS psc_code,
    'https://www.epa.gov/eg/coil-coating-effluent-guidelines' AS link_url
UNION ALL
SELECT
    466 AS psc_code,
    'https://www.epa.gov/eg/porcelain-enameling-effluent-guidelines' AS link_url
UNION ALL
SELECT
    467 AS psc_code,
    'https://www.epa.gov/eg/aluminum-forming-effluent-guidelines' AS link_url
UNION ALL
SELECT
    468 AS psc_code,
    'https://www.epa.gov/eg/copper-forming-effluent-guidelines' AS link_url
UNION ALL
SELECT
    469 AS psc_code,
    'https://www.epa.gov/eg/electrical-and-electronic-components-effluent-guidelines' AS link_url
UNION ALL
SELECT
    471 AS psc_code,
    'https://www.epa.gov/eg/nonferrous-metals-forming-and-metal-powders-effluent-guidelines' AS link_url;

