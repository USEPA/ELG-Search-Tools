const { basename, resolve } = require('node:path');
const { readFileSync } = require('node:fs');

module.exports = {
  up(queryInterface) {
    const records = JSON.parse(readFileSync(resolve(__dirname, 'data', `${basename(__filename, '.js')}.json`), 'utf8'));

    return queryInterface.bulkInsert({ schema: 'elg_search', tableName: 'Definition' }, records);
  },
  down: (queryInterface) =>
    queryInterface.bulkDelete(
      {
        schema: 'elg_search',
        tableName: 'Definition',
      },
      null,
      {}
    ),
};
