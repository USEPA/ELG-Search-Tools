CREATE OR REPLACE FUNCTION ogr_fdw_sql_table(
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