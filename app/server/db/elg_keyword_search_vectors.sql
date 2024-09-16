CREATE TABLE elg_search."LimitationKeywordSearch" AS 
      SELECT lim_id, psc_code, processop_id, pollutant_code, treatment_id, 
             subcat_title, genprov_section_title, genprov_desc, psc_name, 
             processop_title, secondary, processop_description, wp_lim_calc_desc, processop_notes, 
             alt_lim, lim_pollutant_notes, lta_notes, elg_pollutant_description, 
             treatment_descriptions, wptt_tech_notes, treatment_names, 
             to_tsvector(subcat_title || genprov_section_title || genprov_desc || psc_name) as psc_vector, 
             to_tsvector(processop_title || secondary || processop_description || coalesce(wp_lim_calc_desc, '') || 
                         coalesce(processop_notes, '')) as wp_vector, 
             to_tsvector(coalesce(wp_lim_calc_desc, '') || coalesce(alt_lim, '') || 
                         coalesce(lim_pollutant_notes, '') || coalesce(lta_notes, '') || 
                         elg_pollutant_description) as poll_vector, 
             to_tsvector(coalesce(lta_notes, '') || coalesce(treatment_descriptions, '') || 
                         coalesce(wptt_tech_notes, '') || coalesce(treatment_names, '')) as tt_vector, 
             to_tsvector(subcat_title || genprov_section_title || genprov_desc || psc_name || 
                         processop_title || secondary || processop_description || coalesce(wp_lim_calc_desc, '') || 
                         coalesce(processop_notes, '') || coalesce(alt_lim, '') || 
                         coalesce(lim_pollutant_notes, '') || coalesce(lta_notes, '') || 
                         elg_pollutant_description || coalesce(treatment_descriptions, '') || 
                         coalesce(wptt_tech_notes, '') || coalesce(treatment_names, '')) as all_vector 
      FROM elg_search."ViewLimitationKeywordSearch"; 
      CREATE INDEX "LimitationKeywordSearch_psc_tsv" 
       ON elg_search."LimitationKeywordSearch" USING GIN (psc_vector);
      CREATE INDEX "LimitationKeywordSearch_wp_tsv" 
       ON elg_search."LimitationKeywordSearch" USING GIN (wp_vector);
      CREATE INDEX "LimitationKeywordSearch_poll_tsv" 
       ON elg_search."LimitationKeywordSearch" USING GIN (poll_vector);
      CREATE INDEX "LimitationKeywordSearch_tt_tsv" 
       ON elg_search."LimitationKeywordSearch" USING GIN (tt_vector);
      CREATE INDEX "LimitationKeywordSearch_all_tsv" 
       ON elg_search."LimitationKeywordSearch" USING GIN (all_vector);