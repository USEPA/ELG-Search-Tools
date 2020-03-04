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
	'A_Source_New'))
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
	replace(replace(subcat_title, U&'\00A0', '\u00A0'), U&'\0097', '\u0097') as subcat_title,
	subcat_code,
	subcat_cfr_section,
	replace(replace(replace(replace(replace(replace(replace(subcat_applicability, U&'\00A0', '\u00A0'), U&'\0097', '\u0097'), U&'\00A7', '\u00A7'), U&'\0091', '\u0091'), U&'\0092', '\u0092'), U&'\0093', '\u0093'), U&'\0094', '\u0094') as subcat_applicability,
	subcat_includes_bmps,
	subcat_notes,
	moredetail_flag,
	source_id,
	detail_desc,
	replace(replace(combo_subcat, U&'\00A0', '\u00A0'), U&'\0097', '\u0097') as combo_subcat,
	reservedflag
from
	elg_database.n2_subcategory;


create view elg_database.view_n3a_control_technology_notes as
select
    loc,
    ct_cfr_section,
    replace(replace(replace(ct_notes, U&'\00A7', '\u00A7'), chr(147), '"'), chr(148), '"') as ct_notes
from
    elg_database.n3a_control_technology_notes;


create view elg_database.view_n4_wastestream_process as
select
    processop_id,
    ct_id,
    processop_title,
    cfr_sect,
    TRIM(COALESCE (processop_constraint1, '') || ' ' || COALESCE ('<strong><u>' || processop_andor1 || '</u></strong>', '') || ' ' ||
    COALESCE (processop_constraint2, '') || ' ' || COALESCE ('<strong><u>' || processop_andor2 || '</u></strong>', '') || ' ' ||
    COALESCE (processop_constraint3, '') || ' ' || COALESCE ('<strong><u>' || processop_andor3 || '</u></strong>', '') || ' ' ||
    COALESCE (processop_constraint4, '')) as secondary,
    replace(processop_description, U&'\00A7', '\u00A7') as processop_description,
    replace(lim_calc_desc, U&'\00A7', '\00A7') as lim_calc_desc,
    replace(replace(replace(processop_notes, U&'\0097', '\u0097'), U&'\0085', '\u0085'), U&'\00A7', '\00A7') as processop_notes,
    case when zero_discharge = '1' then true else false end as zero_discharge,
    case when no_limits = '1' then true else false end as no_limits,
    case when includes_bmps = '1' then true else false end as includes_bmps,
    source_id,
    sortorder,
    --TODO: use value from source data when it is available case when alternative_requirement = '1' then true else false end as alternative_requirement, 
    false as alternative_requirement,
    case when process_addtdetail = '1' then true else false end as process_addtdetail
from
    elg_database.n4_wastestream_process;


create view elg_database.view_n5_pollutant_limitations as
SELECT 
	processop_id, 
	lim_id, 
	pollutant_code, 
	case 
		when  lim_id = 17175	THEN	'0.17 + (8 X (no. of hides)/kg RM)'
	 	when  lim_id = 17176	THEN	'0.21 + (11 X (no. of hides)/kg RM)'
		when  lim_id = 17178	THEN	'0.34 + (8 X (no. of hides)/kg RM)'
		when  lim_id = 17179	THEN	'0.42 + (11 X (no. of hides)/kg RM)'
		when  lim_id = 17204	THEN	'0.09 + (3.6 X (no. of hides)/kg RM)'
		when  lim_id = 17205	THEN	'0.11 + (6.2 X (no. of hides)/kg RM)'
		when  lim_id = 17206	THEN	'0.18 + (3.6 X (no. of hides)/kg RM)'
		when  lim_id = 17207	THEN	'0.22 + (6.2 X (no. of hides)/kg RM)'
		when  lim_id = 17220	THEN	'0.09 + (3.6 X (no. of hides)/kg RM)'
		when  lim_id = 17221	THEN	'0.18 + (3.6 X (no. of hides)/kg RM)'
		when  lim_id = 17222	THEN	'0.11 + (6.2 X (no. of hides)/kg RM)'
		when  lim_id = 17223	THEN	'0.22 + (6.2 X (no. of hides)/kg RM)'
		else lim_value 
	end as lim_value, 
	lim_value_min, 
	lim_value_max, 
	alt_lim_flag, 
	case when lim_id = 6799 then 'As referenced in 423.16(e)' else alt_lim end as alt_lim, --odd character in source data 
	lim_duration_code, 
	discharge_frequency, 
	unit_code, 
	analytical_method_id, 
	wf_id, 
	fn_id, 
	question_desc,
	mdl, 
	ml, 
	lim_calc_desc, 
	source_id, 
	qc_flag, 
	qc_notes, 
	zero_discharge, 
	replace(replace(replace(replace(pollutant_notes, U&'\00A7', '\00A7'), chr(147), '"'), chr(148), '"'), 'µ', 'u') as pollutant_notes, 
	dataentry_psc_code, 
	qc_initials, 
	treatment_id
FROM elg_database.n5_pollutant_limitations;

create view elg_database.view_key_ttcodes as
select
	"name", 
	code, 
	category, 
	variations, 
	replace(description, chr(150), '-') as description
from elg_database.key_ttcodes;

create view elg_database.view_a_cfr_citation_history as
select
	source_id,
	psc,
	cfr_section,
	replace(subcategory, chr(151), '-') as subcategory,
	cfr_section_description,
	publication_date,
	frn__in_cfr_,
	frn__1st_page_,
	notes
from elg_database.a_cfr_citation_history;

create view elg_database.view_a_definition as 
select
	cfr_part,
	def_id,
	subcat_cfr_section,
	cfr_subsection,
	replace(replace(replace(replace(term, chr(150), '-'), chr(151), '-'), chr(147), '"'), chr(148), '"') as term,
	replace(replace(replace(replace(replace(replace(definition, U&'\00B0', '\u00B0'), chr(150), '-'), chr(151), '-'), U&'\00A7', '\u00A7'), chr(147), '"'), chr(148), '"') as definition,
	deftype,
	additional_detail_cfr_flag,
	source_id,
	qc_flag,
	qc_notes
from elg_database.a_definition;

create view elg_database.view_a_generalprovisions as 
select
	psc_code,
	genprov_cfr_section,
	replace(replace(genprov_section_title, chr(150), '-'), chr(151), '-') as genprov_section_title,
	replace(replace(replace(genprov_desc, chr(147), '"'), chr(148), '"'), U&'\00A7', '\u00A7') as genprov_desc,
	genprov_monitoring_reqs,
	genprov_bmps_reqs,
	genprov_source_id,
	additional_detail_in_cfr_
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
	source_notes,
	fr_revision_type,
	replace(replace(rin, chr(150), '-'), chr(151), '-') as rin,
	substantial_update_
from elg_database.a_source_new;