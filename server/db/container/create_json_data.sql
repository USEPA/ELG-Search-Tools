CREATE OR REPLACE PROCEDURE elg_database.generate_seed_file (from_item text, directory text, filename text)
LANGUAGE plpgsql
AS $$
DECLARE
    full_path text;
BEGIN
    full_path := format('%s/%s', directory, filename);
    EXECUTE format('COPY (SELECT json_agg(row_to_json(t)) FROM %s as t) TO %L', from_item, full_path);
END;
$$;

CREATE OR REPLACE PROCEDURE elg_database.generate_seed_file (record text, from_item text, directory text, filename text)
LANGUAGE plpgsql
AS $$
DECLARE
    full_path text;
BEGIN
    full_path := format('%s/%s', directory, filename);
    EXECUTE format('COPY (SELECT json_agg(row_to_json(%s)) FROM %s) TO %L', record, from_item, full_path);
END;
$$;

CREATE OR REPLACE PROCEDURE elg_database.generate_seed_files (directory text)
LANGUAGE plpgsql
AS $$
BEGIN
    SET search_path TO elg_database;
    CALL generate_seed_file ('(select elg_database.n1_cfr.*, case when elg_database.n1_cfr_url.link_url is null then ''https://www.epa.gov/eg'' else elg_database.n1_cfr_url.link_url end as link_url from elg_database.n1_cfr left outer join elg_database.n1_cfr_url on elg_database.n1_cfr.psc_code = elg_database.n1_cfr_url.psc_code)', directory, 'pointSourceCategories.json');
    CALL generate_seed_file ('view_n2_subcategory', directory, 'pointSourceSubcategories.json');
    CALL generate_seed_file ('n3_control_technology', directory, 'controlTechnologies.json');
    CALL generate_seed_file ('view_n3a_control_technology_notes', directory, 'controlTechnologyNotes.json');
    CALL generate_seed_file ('view_n4_wastestream_process', directory, 'wastestreamProcesses.json');
    CALL generate_seed_file ('(SELECT colName from (select treatment_id, treatment_description, treatment_codes) colName)', 'n4b_technology_bases', directory, 'treatmentTechnologies.json');
    CALL generate_seed_file ('view_key_ttcodes', directory, 'treatmentTechnologyCodes.json');
    CALL generate_seed_file ('view_n4c_technology_bases_ws', directory, 'wastestreamProcessTreatmentTechnologies.json');
    CALL generate_seed_file ('(SELECT colName from (select processop_id, treatment_id, pollutant_code) colName)', 'n4c_technology_bases_ws_pollutants', directory, 'wastestreamProcessTreatmentTechnologyPollutants.json');
    CALL generate_seed_file ('(SELECT colName from (select pollutant_code, pollutant_desc, elg_pollutant_description, pollutant_groups) colName)', 'view_ref_pollutant', directory, 'pollutants.json');
    CALL generate_seed_file ('(SELECT colName from (select id, group_description) colName)', 'ref_pollutant_group', directory, 'pollutantGroups.json');
    CALL generate_seed_file ('(SELECT colName from (select processop_id, lim_id, pollutant_code, treatment_id, lim_duration_code, discharge_frequency, lim_value, unit_code, lim_value_min, lim_value_max, zero_discharge, alt_lim_flag, alt_lim, alt_lim_description, lim_calc_desc, pollutant_notes, typo_flag_lim_value) colName)', 'view_n5_pollutant_limitations', directory, 'limitations.json');
    CALL generate_seed_file ('ref_limit_duration', directory, 'limitationDurations.json');
    CALL generate_seed_file ('view_ref_limit_units', directory, 'limitationUnits.json');
    CALL generate_seed_file ('n5_pollutant_limitations_range', directory, 'limitationRanges.json');
    CALL generate_seed_file ('(SELECT colName from (select ltaid, lim_id, treatment_id, lta_value, lta_units, lim_duration_code, discharge_frequency, tech_ref, notes) colName)', 'n5b_pollutant_ltas', directory, 'longTermAverages.json');
    CALL generate_seed_file ('(SELECT colName from (select source_id, source_title, display_title) colName)', 'view_a_source_new', directory, 'referenceSources.json');
    CALL generate_seed_file ('view_ref_naics_code', directory, 'naicsCodes.json');
    CALL generate_seed_file ('view_ref_sic_code', directory, 'sicCodes.json');
    CALL generate_seed_file ('view_ref_psc_naics_xwalk', directory, 'pointSourceCategoryNaicsCodes.json');
    CALL generate_seed_file ('view_ref_psc_sic_xwalk', directory, 'pointSourceCategorySicCodes.json');
    CALL generate_seed_file ('view_a_cfr_citation_history', directory, 'citationHistories.json');
    CALL generate_seed_file ('view_a_generalprovisions', directory, 'generalProvisions.json');
    CALL generate_seed_file ('view_a_definition', directory, 'definitions.json');
END;
$$;

