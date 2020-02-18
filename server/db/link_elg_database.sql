drop schema if exists elg_database cascade;

create schema elg_database;

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
	unnest( string_to_array(elg_search.ogr_fdw_sql_table(conn), E'\n') ) as table_name
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
	'5C_Weight_Factors_Pollutants'))
select
	string_agg( replace(replace(replace(regexp_replace(elg_search.ogr_fdw_sql_table(conn, tb.table_name), 'CREATE SERVER (.*);(.*)CREATE FOREIGN TABLE ([a-z0-9\_]+)', E'DROP FOREIGN TABLE IF EXISTS elg_database.\\3;CREATE FOREIGN TABLE elg_database.\\3'), 'myserver', 'elg_database_odbc'), 'fid bigint,', ''), 'geom Geometry(Geometry),', ''), E'\n') as sql
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
    replace(ct_notes, U&'\00A7', '\u00A7') as ct_notes
from
    elg_database.n3a_control_technology_notes;


create view elg_database.view_n4_wastestream_process as
select
    processop_id,
    ct_id,
    processop_title,
    cfr_sect,
    TRIM(COALESCE (processop_constraint1, '') || ' ' || COALESCE (processop_andor1, '') || ' ' ||
    COALESCE (processop_constraint2, '') || ' ' || COALESCE (processop_andor2, '') || ' ' ||
    COALESCE (processop_constraint3, '') || ' ' || COALESCE (processop_andor3, '') || ' ' ||
    COALESCE (processop_constraint4, '')) as secondary,
    replace(processop_description, U&'\00A7', '\u00A7') as processop_description,
    zero_discharge,
    no_limits,
    includes_bmps,
    source_id,
    sortorder
from
    elg_database.n4_wastestream_process;

