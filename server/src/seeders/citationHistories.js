const { basename, resolve } = require('node:path');
const { readFileSync } = require('node:fs');

module.exports = {
  up(queryInterface) {
    const records = readFileSync(resolve(__dirname, 'data', `${basename(__filename, '.js')}.json`));

    return queryInterface.bulkInsert({ schema: 'elg_search', tableName: 'CitationHistory' }, records);
  },
  down: (queryInterface) =>
    queryInterface.bulkDelete(
      {
        schema: 'elg_search',
        tableName: 'CitationHistory',
      },
      null,
      {}
    ),
};
