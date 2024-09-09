const { basename, resolve } = require('node:path');
const { readFileSync } = require('node:fs');

module.exports = {
  up(queryInterface) {
    /*
    -	407: Canned and Preserved Fruits and Vegetables
    -	412: Concentrated Animal Feeding Operations
    -	413: Electroplating
    -	417: Soap and Detergent Mfr
    -	423: Steam Electric Generating
    -	427: Asbestos Mfr
    -	432: Meat and Poultry Products
    -	433: Metal Finishing
    -	437: Centralized Waste Treatment
    -	438: Metal Products and Machinery
    -	439: Pharmaceutical
    -	444: Waste Combustors
    -	461: Battery Manufacturing
    -	469: Electrical and Electronic Components
     */
    //let showThese = [407, 413, 417, 433]; //staging and production
    //if (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'development') {
    //  showThese = [407, 412, 413, 417, 423, 427, 432, 433, 437, 438, 439, 444, 461, 469]; //dev and local
    //}

    const records = JSON.parse(readFileSync(resolve(__dirname, 'data', `${basename(__filename, '.js')}.json`), 'utf8'));

    records.forEach(function(record) {
      //record.IncludeInSearchTool = showThese.includes(record.psc_code);
      record.IncludeInSearchTool = true; // as of 8/17/2020, include all PSCs in the search tool in all environments
    });

    return queryInterface.bulkInsert({ schema: 'elg_search', tableName: 'PointSourceCategory' }, records);
  },
  down: (queryInterface) =>
    queryInterface.bulkDelete({ schema: 'elg_search', tableName: 'PointSourceCategory' }, null, {}),
};
