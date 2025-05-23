select
	'PointSourceCategory' as tablename,
	string_agg( cast(row_to_json(row, true) as text), E',\n') as json_data
from
	(
	select
		elg_database.n1_cfr.*,
		case 
			when elg_database.n1_cfr_url.link_url is null then 'https://www.epa.gov/eg' 
			else elg_database.n1_cfr_url.link_url 
		end as link_url
	from
		elg_database.n1_cfr
	left outer join elg_database.n1_cfr_url on
		elg_database.n1_cfr.psc_code = elg_database.n1_cfr_url.psc_code) row
union all
select 'PointSourceSubcategory' as tablename, string_agg( cast(row_to_json(tablename.*,true) as text), E',\n') as json_data from elg_database.view_n2_subcategory as tablename union all
select 'ControlTechnology' as tablename, string_agg( cast(row_to_json(tablename.*,true) as text), E',\n') as json_data from elg_database.n3_control_technology as tablename union all
select 'ControlTechnologyNotes' as tablename, string_agg( cast(row_to_json(tablename.*,true) as text), E',\n') as json_data from elg_database.view_n3a_control_technology_notes as tablename union all
select 'WastestreamProcess' as tablename, string_agg( cast(row_to_json(tablename.*,true) as text), E',\n') as json_data from elg_database.view_n4_wastestream_process as tablename union all
select 'TreatmentTechnology' as tablename, string_agg( cast(row_to_json((SELECT colName from (select treatment_id, treatment_description, treatment_codes) colName)) as text), E',\n') as json_data from elg_database.n4b_technology_bases as tablename union all
select 'TreatmentTechnologyCode' as tablename, string_agg( cast(row_to_json(tablename.*,true) as text), E',\n') as json_data from elg_database.view_key_ttcodes as tablename union all
select 'WastestreamProcessTreatmentTechnology' as tablename, string_agg( cast(row_to_json(tablename.*, true) as text), E',\n') as json_data from elg_database.view_n4c_technology_bases_ws as tablename union all
select 'WastestreamProcessTreatmentTechnologyPollutant' as tablename, string_agg( cast(row_to_json((SELECT colName from (select processop_id, treatment_id, pollutant_code) colName)) as text), E',\n') as json_data from elg_database.n4c_technology_bases_ws_pollutants as tablename union all
select 'Pollutant' as tablename, string_agg( cast(row_to_json((SELECT colName from (select pollutant_code, pollutant_desc, elg_pollutant_description, pollutant_groups) colName)) as text), E',\n') as json_data from elg_database.view_ref_pollutant as tablename union all
select 'PollutantGroup' as tablename, string_agg( cast(row_to_json((SELECT colName from (select id, group_description) colName)) as text), E',\n') as json_data from elg_database.ref_pollutant_group as tablename union all
select 'Limitation' as tablename, string_agg( cast(row_to_json((SELECT colName from (select processop_id, lim_id, pollutant_code, treatment_id, lim_duration_code, discharge_frequency, lim_value, unit_code, lim_value_min, lim_value_max, zero_discharge, alt_lim_flag, alt_lim, alt_lim_description, lim_calc_desc, pollutant_notes, typo_flag_lim_value) colName)) as text), E',\n') as json_data from elg_database.view_n5_pollutant_limitations as tablename union all
select 'LimitationDuration' as tablename, string_agg( cast(row_to_json(tablename.*,true) as text), E',\n') as json_data from elg_database.ref_limit_duration as tablename union all
select 'LimitationUnit' as tablename, string_agg( cast(row_to_json(tablename.*,true) as text), E',\n') as json_data from elg_database.view_ref_limit_units as tablename union all
select 'LimitationRange' as tablename, string_agg( cast(row_to_json(tablename.*,true) as text), E',\n') as json_data from elg_database.n5_pollutant_limitations_range as tablename union all
select 'LongTermAverage' as tablename, string_agg( cast(row_to_json((SELECT colName from (select ltaid, lim_id, treatment_id, lta_value, lta_units, lim_duration_code, discharge_frequency, tech_ref, notes) colName)) as text), E',\n') as json_data from elg_database.n5b_pollutant_ltas as tablename union all
select 'ReferenceSource' as tablename, string_agg( cast(row_to_json((SELECT colName from (select source_id, source_title, display_title) colName)) as text), E',\n') as json_data from elg_database.view_a_source_new as tablename union all
select 'NaicsCode' as tablename, string_agg( cast(row_to_json(tablename.*,true) as text), E',\n') as json_data from elg_database.view_ref_naics_code as tablename union all
select 'SicCode' as tablename, string_agg( cast(row_to_json(tablename.*,true) as text), E',\n') as json_data from elg_database.view_ref_sic_code as tablename union all
select 'PointSourceCategoryNaicsCode' as tablename, string_agg( cast(row_to_json(tablename.*,true) as text), E',\n') as json_data from elg_database.view_ref_psc_naics_xwalk as tablename union all
select 'PointSourceCategorySicCode' as tablename, string_agg( cast(row_to_json(tablename.*,true) as text), E',\n') as json_data from elg_database.view_ref_psc_sic_xwalk as tablename union all
select 'CitationHistory' as tablename, string_agg( cast(row_to_json(tablename.*,true) as text), E',\n') as json_data from elg_database.view_a_cfr_citation_history as tablename union all
select 'GeneralProvision' as tablename, string_agg( cast(row_to_json(tablename.*,true) as text), E',\n') as json_data from elg_database.view_a_generalprovisions as tablename union all
select 'Definition' as tablename, string_agg( cast(row_to_json(tablename.*,true) as text), E',\n') as json_data from elg_database.view_a_definition as tablename;

