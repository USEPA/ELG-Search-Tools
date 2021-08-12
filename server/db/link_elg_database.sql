drop schema if exists elg_database cascade;

create schema elg_database;

CREATE OR REPLACE FUNCTION elg_database.ogr_fdw_sql_table(
    data_source text,
    layer text DEFAULT ''::text)
  RETURNS text AS
$$
BEGIN
        DROP TABLE IF EXISTS ogr_fdw_out;
        CREATE TEMP TABLE ogr_fdw_out(out text);
        IF layer > '' THEN
        EXECUTE 'COPY ogr_fdw_out FROM PROGRAM ''"C:/Program Files/PostgreSQL/9.6/bin/ogr_fdw_info" -s "'
            || data_source || '" -l "'
            || layer || '"'' WITH (format ''csv'', delimiter ''|'')';
        ELSE
                EXECUTE 'COPY ogr_fdw_out FROM PROGRAM ''"C:/Program Files/PostgreSQL/9.6/bin/ogr_fdw_info" -s "'
                || data_source
                || '"''  WITH (format ''csv'', delimiter ''|'')';
        END IF;
        RETURN (SELECT string_agg(out,E'\n') from ogr_fdw_out);
END;

$$
  LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

drop server if exists elg_database_odbc;

create server elg_database_odbc foreign data wrapper ogr_fdw options ( datasource 'odbc:elg_database',
format 'ODBC' );

do language plpgsql $$
declare
	var_sql text;

begin var_sql := (with conn as (
select
	'odbc:elg_database'::text as conn),
cte_tb_names as (
select
	unnest( string_to_array(elg_database.ogr_fdw_sql_table(conn), E'\n') ) as table_name
from
	conn) ,
tb as (
select
	trim(table_name) as table_name
from
	cte_tb_names
where
	trim(table_name) in ('1_CFR',
	'2_Subcategory',
	'3_Control_Technology',
	'3a_Control_Technology_Notes',
	'4_Wastestream_Process',
	'4A_Technology_Bases',
	'4B_Technology_Bases',
	'4C_Technology_Bases_WS',
	'4C_Technology_Bases_WS_Pollutants',
	'5_Pollutant_Limitations',
	'5_Pollutant_Limitations_Range',
	'5B_Pollutant_LTAs',
	'5C_Weight_Factors',
	'5C_Weight_Factors_Pollutants',
	'REF_POLLUTANT',
	'REF_LIMIT_DURATION',
	'REF_LIMIT_UNITS',
	'KEY_TTCodes',
	'A_CFR_Citation_History',
	'A_Definition',
	'A_GeneralProvisions',
	'A_Source_New',
	'KEY_Alt_Lim_Flag',
	'REF_NAICS_CODE',
	'REF_SIC_CODE',
	'REF_PSC_NAICS_XWALK',
	'REF_PSC_SIC_XWALK',
	'REF_Pollutant_Group',
	'5D_Pollutant_Groups'))
select
	string_agg( replace(replace(replace(regexp_replace(elg_database.ogr_fdw_sql_table(conn, tb.table_name), 'CREATE SERVER (.*);(.*)CREATE FOREIGN TABLE ([a-z0-9\_]+)', E'DROP FOREIGN TABLE IF EXISTS elg_database.\\3;CREATE FOREIGN TABLE elg_database.\\3'), 'myserver', 'elg_database_odbc'), 'fid bigint,', ''), 'geom Geometry(Geometry),', ''), E'\n') as sql
from
	tb,
	conn);

execute var_sql;

end ;

$$;

--create views for tables with unicode values or other formatting needs
 create view elg_database.view_n2_subcategory as
select
	psc_code,
	subcat_id,
	replace(replace(subcat_title, U&'\00A0', ''), U&'\0097', '-') as subcat_title,
	subcat_code,
	subcat_cfr_section,
	replace(replace(replace(replace(replace(replace(replace(subcat_applicability, U&'\00A0', ''), U&'\0097', '-'), U&'\00A7', '\u00A7'), U&'\0091', ''''), U&'\0092', ''''), U&'\0093', '"'), U&'\0094', '"') as subcat_applicability,
	subcat_includes_bmps,
	subcat_notes,
	moredetail_flag,
	source_id,
	detail_desc,
	replace(replace(combo_subcat, U&'\00A0', ''), U&'\0097', '-') as combo_subcat,
	reservedflag
from
	elg_database.n2_subcategory;


create view elg_database.view_n3a_control_technology_notes as
select
    loc,
    ct_cfr_section,
    replace(replace(replace(replace(replace(ct_notes, U&'\00A7', '\u00A7'), chr(147), '"'), chr(148), '"'), U&'\0097', '-'), U&'\00B5', '\u00B5') as ct_notes,
    case when loc_display = '1' then true else false end as loc_display,
    typo_flag_ct_notes 
from
    elg_database.n3a_control_technology_notes;


create view elg_database.view_n4_wastestream_process as
select
    processop_id,
    ct_id,
    replace(processop_title, U&'\0097', '-') as processop_title,
    cfr_sect,
    TRIM(COALESCE (processop_constraint1, '') || ' ' || COALESCE ('<strong><u>' || processop_andor1 || '</u></strong>', '') || ' ' ||
    COALESCE (processop_constraint2, '') || ' ' || COALESCE ('<strong><u>' || processop_andor2 || '</u></strong>', '') || ' ' ||
    COALESCE (processop_constraint3, '') || ' ' || COALESCE ('<strong><u>' || processop_andor3 || '</u></strong>', '') || ' ' ||
    COALESCE (processop_constraint4, '')) as secondary,
    replace(replace(replace(replace(replace(replace(replace(processop_description, U&'\00A7', '\u00A7'), chr(145), ''''), chr(146), ''''), U&'\0093', '"'), U&'\0094', '"'), U&'\0096', '-'), U&'\0097', '-') as processop_description,
    replace(replace(replace(replace(
	    case 
	    	when processop_id = 25055 then 'Limitations for the parameters are the same as the corresponding limitation specified in \u00A7437.42(e)' --odd character in source data
	    	else lim_calc_desc
	    end	, U&'\00A7', '\u00A7'), U&'\0093', '"'), U&'\0094', '"'), U&'\0097', '-') as lim_calc_desc,
    replace(replace(replace(replace(replace(processop_notes, U&'\0097', '-'), U&'\0085', '...'), U&'\00A7', '\u00A7'), U&'\0093', '"'), U&'\0094', '"') as processop_notes,
    case when zero_discharge = '1' then true else false end as zero_discharge,
    case when no_limits = '1' then true else false end as no_limits,
    case when includes_bmps = '1' then true else false end as includes_bmps,
    source_id,
    sortorder,
    case when alternative_req = '1' then true else false end as alternative_requirement,
    case when voluntary_req = '1' then true else false end as voluntary_requirement,
    case when process_addtdetail = '1' then true else false end as process_addtdetail,
    typo_flag_lim_calc_description,
    typo_flag_po_notes 
from
    elg_database.n4_wastestream_process;


create view elg_database.view_n5_pollutant_limitations as
SELECT
	pl.processop_id,
	pl.lim_id,
	pl.pollutant_code,
	case
		when  pl.lim_id = 70840	THEN	'0.17 + (8 X (no. of hides)/kg RM)'
	 	when  pl.lim_id = 70841	THEN	'0.21 + (11 X (no. of hides)/kg RM)'
		when  pl.lim_id = 70843	THEN	'0.34 + (8 X (no. of hides)/kg RM)'
		when  pl.lim_id = 70844	THEN	'0.42 + (11 X (no. of hides)/kg RM)'
		when  pl.lim_id = 70869	THEN	'0.09 + (3.6 X (no. of hides)/kg RM)'
		when  pl.lim_id = 70870	THEN	'0.11 + (6.2 X (no. of hides)/kg RM)'
		when  pl.lim_id = 70871	THEN	'0.18 + (3.6 X (no. of hides)/kg RM)'
		when  pl.lim_id = 70872	THEN	'0.22 + (6.2 X (no. of hides)/kg RM)'
		when  pl.lim_id = 70885	THEN	'0.09 + (3.6 X (no. of hides)/kg RM)'
		when  pl.lim_id = 70886	THEN	'0.18 + (3.6 X (no. of hides)/kg RM)'
		when  pl.lim_id = 70887	THEN	'0.11 + (6.2 X (no. of hides)/kg RM)'
		when  pl.lim_id = 70888	THEN	'0.22 + (6.2 X (no. of hides)/kg RM)'
		else pl.lim_value
	end as lim_value, --TODO: check these values in the latest data!
	pl.lim_value_min,
	pl.lim_value_max,
	pl.alt_lim_flag,
	case 
		when pl.lim_id = 6799 then 'As referenced in 423.16(e)' --odd character in source data
		when pl.lim_id = 52831 then 'Stock Limitations (C16-C18 internal olefin). PAH mass ratio shall not exceed 1 X 10-5. PAH mass ratio = Mass (g) of PAH (as phenanthrene)/Mass (g) of stock base fluid as determined by EPA Method 1654, Revision A, [specified at \u00A7435.11(u)] entitled "PAH Content of Oil by HPLC/UV," December 1992, which is published as an appendix to subpart A of this part and in "Analytic Methods for the Oil and Gas Extraction Point Source Category," EPA-821-R-11-004. See \u00A7435.11(uu).'
		when pl.lim_id = 52867 then 'Stock Limitations (C16-C18 internal olefin). PAH mass ratio shall not exceed 1 X 10-5. PAH mass ratio = Mass (g) of PAH (as phenanthrene)/Mass (g) of stock base fluid as determined by EPA Method 1654, Revision A, [specified at \u00A7435.11(u)] entitled "PAH Content of Oil by HPLC/UV," December 1992, which is published as an appendix to subpart A of this part and in "Analytic Methods for the Oil and Gas Extraction Point Source Category," EPA-821-R-11-004. See \u00A7435.11(uu).'
		else replace(replace(replace(replace(replace(pl.alt_lim, U&'\00A7', '\u00A7'), U&'\00B0', '\u00B0'), U&'\0093', '"'), U&'\0094', '"'), U&'\00D7', 'X') 
	end as alt_lim,  --TODO: check these values in the latest data!
	pl.lim_duration_code,
	pl.discharge_frequency,
	pl.unit_code,
	pl.analytical_method_id,
	pl.wf_id,
	pl.fn_id,
	pl.question_desc,
	pl.mdl,
	pl.ml,
	replace(pl.lim_calc_desc, U&'\00A7', '\u00A7') as lim_calc_desc,
	pl.source_id,
	pl.qc_flag,
	pl.qc_notes,
	pl.zero_discharge,
	CASE
		when pl.lim_id = 70840 then 'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.17 + 17.6 X (no. of hides)/lbs RM).'
		when pl.lim_id = 70841 then 'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.21 + 24.2 X (no. of hides)/lbs RM).'
		when pl.lim_id = 70843 then 'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.34 + 17.6 X (no. of hides)/lbs RM).'
		when pl.lim_id = 70844 then 'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.42 + 24.2 X (no. of hides)/lbs RM).'
		when pl.lim_id = 70869 then 'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.09 + 7.9 X (no. of hides)/lbs RM).'
		when pl.lim_id = 70870 then 'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.11 + 13.6 X (no. of hides)/lbs RM).'
		when pl.lim_id = 70871 then 'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.18 + 7.9 X (no. of hides)/lbs RM).'
		when pl.lim_id = 70872 then 'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.22 + 13.6 X (no. of hides)/lbs RM).'
		when pl.lim_id = 70885 then 'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.09 + 17.6 X (no. of hides)/lbs RM).'
		when pl.lim_id = 70886 then 'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.18 + 17.6 X (no. of hides)/lbs RM).'
		when pl.lim_id = 70887 then 'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.11 + 24.2 X (no. of hides)/lbs RM).'
		when pl.lim_id = 70888 then 'Hide curing at an independent rendering plan requires an adjustment to the limitation. The additional equation calculates the size of the adjustment based on the number of hides handled. See 1975 Renderer TDD for additional details. The adjustment equation to calculate the limit in pounds per 1000 pounds of raw material is (0.22 + 24.2 X (no. of hides)/lbs RM).'
		else replace(replace(replace(replace(replace(replace(replace(pl.pollutant_notes, U&'\00A7', '\u00A7'), chr(147), '"'), chr(148), '"'), 'ï¿½', 'u'), U&'\00A0', ' '), U&'\00B5', '\u00B5'), U&'\00D7', 'X') 
	end as pollutant_notes,  --TODO: check these values in the latest data!
	pl.dataentry_psc_code,
	pl.qc_initials,
	pl.treatment_id,
	alf.description as alt_lim_description,
	pl.typo_flag_lim_value 
FROM elg_database.n5_pollutant_limitations pl left outer join elg_database.key_alt_lim_flag alf on pl.alt_lim_flag = alf.flag;

create view elg_database.view_key_ttcodes as
select
	"name",
	code,
	category,
	variations,
	replace(replace(replace(description, chr(150), '-'), chr(147), '"'), chr(148), '"') as description
from elg_database.key_ttcodes;

create view elg_database.view_a_cfr_citation_history as
select
	source_id,
	psc,
	replace(cfr_section, U&'\00A0', '') as cfr_section,
	replace(replace(subcategory, U&'\0096', '-'), U&'\0097', '-') as subcategory,
	replace(replace(replace(replace(replace(cfr_section_description, U&'\0093', '"'), U&'\0094', '"'), U&'\0096', '-'), U&'\0097', '-'), U&'\00A0', '') as cfr_section_description,
	publication_date,
	replace(frn__in_cfr_, U&'\00A0', '') as frn__in_cfr_,
	frn__1st_page_,
	replace(notes, U&'\00A7', '\u00A7') as notes
from elg_database.a_cfr_citation_history;

create view elg_database.view_a_definition as
select
	cfr_part,
	def_id,
	subcat_cfr_section,
	cfr_subsection,
	replace(replace(replace(term, U&'\0093', '"'), U&'\0094', '"'), U&'\0097', '-') as term,
	replace(replace(replace(replace(replace(case 
        when cfr_part = 427 and cfr_subsection = '427.71.c' and term = 'Pieces' then '(Subpart G) Floor tile measured in the standard size of 12" X 12" X 3/32".'
        when cfr_part = 420 and cfr_subsection = '420.21.d' and term = 'pg/L' then '(Subpart B) Picograms per liter (ppt = 1.0 X 10-12 gm/L).'
        else definition 
       end, U&'\00A7', '\u00A7'), U&'\0093', '"'), U&'\0094', '"'), U&'\0097', '-'), U&'\00B0', '\u00B0') as definition,
	deftype,
	case when additional_detail_cfr_flag = '1' then true else false end as additional_detail_cfr_flag,
	source_id,
	qc_flag,
	qc_notes,
	typo_flag_definition 
from elg_database.a_definition;

create view elg_database.view_a_generalprovisions as
select
	psc_code,
	genprov_cfr_section,
	replace(genprov_section_title, U&'\0097', '-') as genprov_section_title,
	replace(replace(replace(replace(replace(replace(case 
       	when psc_code = 469 and genprov_cfr_section = '469.13' and genprov_section_title = 'Monitoring' 
       		then '(Subpart A) (a) In lieu of monitoring for TTO, the permitting authority may allow direct dischargers to include the following certification as a “comment” on the Discharge Monitoring Report required by §122.44 (i), formerly §122.62(i): “Based on my  inquiry of the person or persons directly responsible for managing compliance with the permit limitation for total toxic organics (TTO), I certify that, to the best of my knowledge and belief, no dumping of concentrated toxic organics into the wastewaters has occurred since filing the last discharge monitoring report. I further certify that this facility is implementing the solvent management plan submitted to the permitting authority.” (b) In requesting that no monitoring of TTO be required, the direct discharger shall submit a solvent management plan that specifies to the permitting authority''s satisfaction the toxic organic compounds used; the method of disposal used instead of dumping, such as reclamation, contract hauling, or incineration; and procedures for assuring that toxic organics do not routinely spill or leak into the wastewater. The permitting authority shall incorporate the plan as a provision of the permit. (c) In lieu of monitoring for TTO, the control authority may allow industrial users of POTWs to make the following certification as a comment to the periodic reports required by §403.12: “Based on my inquiry of the person or persons directly responsible for managing compliance with the pretreatment standard for total toxic organics (TTO), I certify that, to the best of my knowledge and belief, no dumping of concentrated toxic organics into the wastewaters has occurred since filing the last discharge monitoring report. I further certify that this facility is implementing the solvent management plan submitted to the control authority.” (d) In requesting that no monitoring be required, industrial users of POTWs shall submit a solvent management plan that specifies to the control authority''s satisfaction the toxic organic compounds used; the method of disposal used instead of dumping, such as reclamation, contract hauling, or incineration; and procedures for assuring that toxic organics do not routinely spill or leak into the wastewater.'
       	else genprov_desc 
       end, U&'\00A7', '\u00A7'), U&'\0093', '"'), U&'\0094', '"'), U&'\0097', '-'), U&'\0091', ''''), U&'\0092', '''') as genprov_desc,
	case when genprov_monitoring_reqs = '1' then true else false end as genprov_monitoring_reqs,
	case when genprov_bmps_reqs = '1' then true else false end as genprov_bmps_reqs,
	genprov_source_id,
	case when additional_detail_in_cfr_ = '1' then true else false end as additional_detail_in_cfr_
from elg_database.a_generalprovisions;

create view elg_database.view_a_source_new as
select
	source_id,
	sourcetype_desc,
	psc_code,
	source_link,
	source_rule_stage,
	source_citation,
	source_pub_date,
	source_eff_date,
	replace(replace(replace(replace(replace(replace(replace(source_summary, U&'\00A7', '\u00A7'), chr(145), ''''), chr(146), ''''), chr(147), '"'), chr(148), '"'), chr(150), '-'), chr(151), '-') as source_summary,
	replace(replace(source_docket, chr(150), '-'), chr(151), '-') as source_docket,
	replace(replace(source_title, chr(150), '-'), chr(151), '-') as source_title,
	replace(replace(replace(display_title, chr(150), '-'), chr(151), '-'), U&'\00A0', '') as display_title,
	source_notes,
	fr_revision_type,
	replace(replace(rin, chr(150), '-'), chr(151), '-') as rin,
	substantial_update_
from elg_database.a_source_new;

create view elg_database.view_n4c_technology_bases_ws as
select
	processop_id,
	treatment_id,
	tech_ref,
	replace(replace(replace(replace(replace(replace(tech_notes, chr(147), '"'), chr(148), '"'), U&'\0085', '...'), chr(150), '-'), chr(151), '-'), U&'\00A7', '\u00A7') as tech_notes,
	bmp_type,
	case when zero_discharge = '1' then true else false end as zero_discharge
from elg_database.n4c_technology_bases_ws;

create view elg_database.view_ref_limit_units as
SELECT
	unit_code,
	unit,
	replace(replace(replace(unit_desc, U&'\00A7', '\u00A7'), chr(147), '"'), chr(148), '"') as unit_desc,
	unit_basis
FROM elg_database.ref_limit_units;

create view elg_database.view_ref_pollutant as
SELECT
	p.pollutant_code,
	p.pollutant_desc,
	coalesce(p.elg_pollutant_description, p.pollutant_desc) as elg_pollutant_description,
	replace(pg.pollutant_group, ' ', '') as pollutant_groups
FROM elg_database.ref_pollutant p left outer join elg_database.n5d_pollutant_groups pg on p.pollutant_code = pg.pollutant_code;

create view elg_database.view_ref_sic_code as 
SELECT 
	sic, 
	replace(replace(sic_desc, chr(145), ''''), chr(146), '''') as sic_desc,
	nullif(regexp_replace(sic, '[^0-9]', '', 'g'), '') as sic_code
FROM elg_database.ref_sic_code;

create view elg_database.view_ref_naics_code as 
SELECT 
	naics, 
	naics_desc,
	nullif(regexp_replace(naics, '[^0-9]', '', 'g'), '') as naics_code
FROM elg_database.ref_naics_code;

create view elg_database.view_ref_psc_sic_xwalk as 
SELECT 
	sic, 
	general_psc_code,
	specific_psc_code,
	nullif(regexp_replace(sic, '[^0-9]', '', 'g'), '') as sic_code
FROM elg_database.ref_psc_sic_xwalk x 
where exists (select psc_code from elg_database.n1_cfr c where c.psc_code = x.general_psc_code);

create view elg_database.view_ref_psc_naics_xwalk as 
SELECT 
	naics, 
	psc_code,
	nullif(regexp_replace(naics, '[^0-9]', '', 'g'), '') as naics_code
FROM elg_database.ref_psc_naics_xwalk x 
where exists (select psc_code from elg_database.n1_cfr c where c.psc_code = x.psc_code);

create table elg_database.n1_cfr_url as
SELECT 405 as psc_code, 'https://www.epa.gov/eg/dairy-products-processing-effluent-guidelines' as link_url UNION ALL
SELECT 406 as psc_code, 'https://www.epa.gov/eg/grain-mills-effluent-guidelines' as link_url UNION ALL
SELECT 408 as psc_code, 'https://www.epa.gov/eg/seafood-processing-effluent-guidelines' as link_url UNION ALL
SELECT 410 as psc_code, 'https://www.epa.gov/eg/textile-mills-effluent-guidelines' as link_url UNION ALL
SELECT 411 as psc_code, 'https://www.epa.gov/eg/cement-manufacturing-effluent-guidelines' as link_url UNION ALL
SELECT 412 as psc_code, 'https://www.epa.gov/npdes/animal-feeding-operations-afos#regulations' as link_url UNION ALL
SELECT 413 as psc_code, 'https://www.epa.gov/eg/electroplating-effluent-guidelines' as link_url UNION ALL
SELECT 414 as psc_code, 'https://www.epa.gov/eg/organic-chemicals-plastics-and-synthetic-fibers-effluent-guidelines' as link_url UNION ALL
SELECT 417 as psc_code, 'https://www.epa.gov/eg/soap-and-detergent-manufacturing-effluent-guidelines' as link_url UNION ALL
SELECT 418 as psc_code, 'https://www.epa.gov/eg/fertilizer-manufacturing-effluent-guidelines' as link_url UNION ALL
SELECT 419 as psc_code, 'https://www.epa.gov/eg/petroleum-refining-effluent-guidelines' as link_url UNION ALL
SELECT 420 as psc_code, 'https://www.epa.gov/eg/iron-and-steel-manufacturing-effluent-guidelines' as link_url UNION ALL
SELECT 421 as psc_code, 'https://www.epa.gov/eg/nonferrous-metals-manufacturing-effluent-guidelines' as link_url UNION ALL
SELECT 423 as psc_code, 'https://www.epa.gov/eg/steam-electric-power-generating-effluent-guidelines' as link_url UNION ALL
SELECT 424 as psc_code, 'https://www.epa.gov/eg/ferroalloy-manufacturing-effluent-guidelines' as link_url UNION ALL
SELECT 425 as psc_code, 'https://www.epa.gov/eg/leather-tanning-and-finishing-effluent-guidelines' as link_url UNION ALL
SELECT 426 as psc_code, 'https://www.epa.gov/eg/glass-manufacturing-effluent-guidelines' as link_url UNION ALL
SELECT 429 as psc_code, 'https://www.epa.gov/eg/timber-products-processing-effluent-guidelines' as link_url UNION ALL
SELECT 430 as psc_code, 'https://www.epa.gov/eg/pulp-paper-and-paperboard-effluent-guidelines' as link_url UNION ALL
SELECT 432 as psc_code, 'https://www.epa.gov/eg/meat-and-poultry-products-effluent-guidelines' as link_url UNION ALL
SELECT 433 as psc_code, 'https://www.epa.gov/eg/metal-finishing-effluent-guidelines' as link_url UNION ALL
SELECT 434 as psc_code, 'https://www.epa.gov/eg/coal-mining-effluent-guidelines' as link_url UNION ALL
SELECT 435 as psc_code, 'https://www.epa.gov/eg/oil-and-gas-extraction-effluent-guidelines' as link_url UNION ALL
SELECT 436 as psc_code, 'https://www.epa.gov/eg/mineral-mining-and-processing-effluent-guidelines' as link_url UNION ALL
SELECT 437 as psc_code, 'https://www.epa.gov/eg/centralized-waste-treatment-effluent-guidelines' as link_url UNION ALL
SELECT 438 as psc_code, 'https://www.epa.gov/eg/metal-products-and-machinery-effluent-guidelines' as link_url UNION ALL
SELECT 439 as psc_code, 'https://www.epa.gov/eg/pharmaceutical-manufacturing-effluent-guidelines' as link_url UNION ALL
SELECT 440 as psc_code, 'https://www.epa.gov/eg/ore-mining-and-dressing-effluent-guidelines' as link_url UNION ALL
SELECT 441 as psc_code, 'https://www.epa.gov/eg/dental-effluent-guidelines' as link_url UNION ALL
SELECT 442 as psc_code, 'https://www.epa.gov/eg/transportation-equipment-cleaning-effluent-guidelines' as link_url UNION ALL
SELECT 443 as psc_code, 'https://www.epa.gov/eg/paving-and-roofing-materials-effluent-guidelines' as link_url UNION ALL
SELECT 444 as psc_code, 'https://www.epa.gov/eg/waste-combustors-effluent-guidelines' as link_url UNION ALL
SELECT 445 as psc_code, 'https://www.epa.gov/eg/landfills-effluent-guidelines' as link_url UNION ALL
SELECT 446 as psc_code, 'https://www.epa.gov/eg/paint-formulating-effluent-guidelines' as link_url UNION ALL
SELECT 447 as psc_code, 'https://www.epa.gov/eg/ink-formulating-effluent-guidelines' as link_url UNION ALL
SELECT 449 as psc_code, 'https://www.epa.gov/eg/airport-deicing-effluent-guidelines' as link_url UNION ALL
SELECT 450 as psc_code, 'https://www.epa.gov/eg/construction-and-development-effluent-guidelines' as link_url UNION ALL
SELECT 451 as psc_code, 'https://www.epa.gov/eg/concentrated-aquatic-animal-production-effluent-guidelines' as link_url UNION ALL
SELECT 454 as psc_code, 'https://www.epa.gov/eg/gum-and-wood-chemicals-manufacturing-effluent-guidelines' as link_url UNION ALL
SELECT 455 as psc_code, 'https://www.epa.gov/eg/pesticide-chemicals-effluent-guidelines' as link_url UNION ALL
SELECT 457 as psc_code, 'https://www.epa.gov/eg/explosives-manufacturing-effluent-guidelines' as link_url UNION ALL
SELECT 458 as psc_code, 'https://www.epa.gov/eg/carbon-black-manufacturing-effluent-guidelines' as link_url UNION ALL
SELECT 459 as psc_code, 'https://www.epa.gov/eg/photographic-processing-effluent-guidelines' as link_url UNION ALL
SELECT 461 as psc_code, 'https://www.epa.gov/eg/battery-manufacturing-effluent-guidelines' as link_url UNION ALL
SELECT 463 as psc_code, 'https://www.epa.gov/eg/plastics-molding-and-forming-effluent-guidelines' as link_url UNION ALL
SELECT 464 as psc_code, 'https://www.epa.gov/eg/metal-molding-and-casting-foundries-effluent-guidelines' as link_url UNION ALL
SELECT 465 as psc_code, 'https://www.epa.gov/eg/coil-coating-effluent-guidelines' as link_url UNION ALL
SELECT 466 as psc_code, 'https://www.epa.gov/eg/porcelain-enameling-effluent-guidelines' as link_url UNION ALL
SELECT 467 as psc_code, 'https://www.epa.gov/eg/aluminum-forming-effluent-guidelines' as link_url UNION ALL
SELECT 468 as psc_code, 'https://www.epa.gov/eg/copper-forming-effluent-guidelines' as link_url UNION ALL
SELECT 469 as psc_code, 'https://www.epa.gov/eg/electrical-and-electronic-components-effluent-guidelines' as link_url UNION ALL
SELECT 471 as psc_code, 'https://www.epa.gov/eg/nonferrous-metals-forming-and-metal-powders-effluent-guidelines' as link_url;

