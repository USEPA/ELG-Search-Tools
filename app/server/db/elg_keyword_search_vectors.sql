DROP TABLE IF EXISTS elg_search."LimitationKeywordSearch";
CREATE TABLE elg_search."LimitationKeywordSearch" AS
      SELECT lim_id, psc_code, processop_id, pollutant_code, treatment_id,
             subcat_title, genprov_section_title, genprov_desc, psc_name,
             processop_title, secondary, processop_description, wp_lim_calc_desc, processop_notes,
             alt_lim, lim_pollutant_notes, lta_notes, elg_pollutant_description,
             treatment_descriptions, wptt_tech_notes, treatment_names,
             -- concat_ws separates the fields so the last word of one does not fuse to the first
             -- word of the next, and skips nulls so a single null field cannot void the whole vector
             to_tsvector(concat_ws(' ', subcat_title, genprov_section_title, genprov_desc, psc_name)) as psc_vector,
             to_tsvector(concat_ws(' ', processop_title, secondary, processop_description, wp_lim_calc_desc,
                                   processop_notes)) as wp_vector,
             to_tsvector(concat_ws(' ', wp_lim_calc_desc, alt_lim, lim_pollutant_notes, lta_notes,
                                   elg_pollutant_description)) as poll_vector,
             to_tsvector(concat_ws(' ', lta_notes, treatment_descriptions, wptt_tech_notes,
                                   treatment_names)) as tt_vector,
             to_tsvector(concat_ws(' ', subcat_title, genprov_section_title, genprov_desc, psc_name,
                                   processop_title, secondary, processop_description, wp_lim_calc_desc,
                                   processop_notes, alt_lim, lim_pollutant_notes, lta_notes,
                                   elg_pollutant_description, treatment_descriptions, wptt_tech_notes,
                                   treatment_names)) as all_vector
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

-- Maps each lexeme in a category's psc_vector text back to the words that produced it, so the
-- results pages can highlight the word actually present ("precipitation" matches "precipitator").
-- Built from the same fields as psc_vector, so every word that can cause a match is listed here.
DROP TABLE IF EXISTS elg_search."PointSourceCategoryLexeme";
CREATE TABLE elg_search."PointSourceCategoryLexeme" AS
      WITH texts AS (
        SELECT DISTINCT psc_code,
               concat_ws(' ', subcat_title, genprov_section_title, genprov_desc, psc_name) AS txt
          FROM elg_search."LimitationKeywordSearch"
      )
      SELECT t.psc_code, l.lexeme, array_agg(DISTINCT d.token ORDER BY d.token) AS tokens
        FROM texts t, ts_debug(t.txt) d, unnest(d.lexemes) l(lexeme)
       GROUP BY t.psc_code, l.lexeme;
      CREATE INDEX "PointSourceCategoryLexeme_psc_lexeme"
       ON elg_search."PointSourceCategoryLexeme" (psc_code, lexeme);
