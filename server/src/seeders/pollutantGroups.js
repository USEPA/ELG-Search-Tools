const { basename, resolve } = require('node:path');
const { readFileSync } = require('node:fs');

module.exports = {
  up(queryInterface) {
    const records = readFileSync(resolve(__dirname, `${basename(__filename, '.js')}.json`));

    return queryInterface.bulkInsert({ schema: 'elg_search', tableName: 'PollutantGroup' }, records);
  },
  down: (queryInterface) =>
    queryInterface.bulkDelete(
      {
        schema: 'elg_search',
        tableName: 'PollutantGroup',
      },
      null,
      {}
    ),
};
