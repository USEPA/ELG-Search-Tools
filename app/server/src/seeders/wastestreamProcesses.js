const { basename, resolve } = require('node:path');
const { readFileSync } = require('node:fs');
const { DataTypes } = require('sequelize');

module.exports = {
  up(queryInterface) {
    const records = JSON.parse(readFileSync(resolve(__dirname, 'data', `${basename(__filename, '.js')}.json`), 'utf8'));

    // bulkInsert rejects a plain object unless it is told the column is jsonb
    return queryInterface.bulkInsert(
      { schema: 'elg_search', tableName: 'WastestreamProcess' },
      records,
      {},
      { secondary_parts: { type: new DataTypes.JSONB() } }
    );
  },
  down: (queryInterface) =>
    queryInterface.bulkDelete(
      {
        schema: 'elg_search',
        tableName: 'WastestreamProcess',
      },
      null,
      {}
    ),
};
