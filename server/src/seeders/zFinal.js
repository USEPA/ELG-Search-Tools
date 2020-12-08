module.exports = {
  up(queryInterface) {
    return queryInterface.sequelize.query('update elg_search."TreatmentTechnology" tt\n' +
      'set treatment_names = (SELECT string_agg((( SELECT "TreatmentTechnologyCode".name\n' +
      '                   FROM elg_search."TreatmentTechnologyCode"\n' +
      '                  WHERE upper("TreatmentTechnologyCode".code::text) = upper(x_1.treatment_code)))::text, \' + \'::text)\n' +
      '           FROM elg_search."TreatmentTechnology" tt_sub,\n' +
      '            LATERAL regexp_split_to_table(tt_sub.treatment_codes::text, \'; \'::text) WITH ORDINALITY x_1(treatment_code, rn)\n' +
      '           where tt_sub.treatment_id = tt.treatment_id \n' +
      '            GROUP BY tt_sub.treatment_id, tt_sub.treatment_codes, tt_sub.treatment_description\n' +
      '          ORDER BY tt_sub.treatment_codes)').then(() =>
    {
      queryInterface.sequelize.query("reindex database elg_search")
    });
  },
  //down: (queryInterface) => {}
};
