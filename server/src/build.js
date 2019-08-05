const { execSync } = require('child_process');

if (process.env.HEROKU_ENV === 'dev') {
  execSync('npm run build:dev');
} else {
  // migrate without undoing to only apply schema updates without wiping out database
  execSync('sequelize db:migrate');

  // undo seeds and execute non-dev seeders for lookup data (do not insert any dummy data and do not delete user-entered data)
  execSync('sequelize db:seed:undo:all');
  execSync('sequelize db:seed --seed ref-role');

  // run production build
  execSync('npm run build:prod');
}
