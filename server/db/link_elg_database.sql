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
        EXECUTE 'COPY ogr_fdw_out FROM PROGRAM ''"C:/Program Files/PostgreSQL/12/bin/ogr_fdw_info" -s "'
            || data_source || '" -l "'
            || layer || '"'' WITH (format ''csv'', delimiter ''|'')';
        ELSE
                EXECUTE 'COPY ogr_fdw_out FROM PROGRAM ''"C:/Program Files/PostgreSQL/12/bin/ogr_fdw_info" -s "'
                || data_source
                || '"''  WITH (format ''csv'', delimiter ''|'')';
        END IF;
        RETURN (SELECT string_agg(out,E'\n') from ogr_fdw_out);
END;

$$
  LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

drop server if exists elg_database_odbc;

create server elg_database_odbc
	foreign data wrapper ogr_fdw
	options ( datasource 'C:\\dev\\ELG-Search-Tools\\server\\db\\elg_database.accdb', format 'ODBC' );

do language plpgsql $$
declare
	var_sql text;

begin var_sql := (with conn as (
select
	'C:\\dev\\ELG-Search-Tools\\server\\db\\elg_database.accdb'::text as conn),
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

RAISE notice '%', var_sql;

execute var_sql;

end ;

$$;
