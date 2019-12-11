const { execSync } = require('child_process');

if (process.env.HEROKU_ENV === 'dev') {
  execSync('npm run build:dev');
} else {
  // run production build
  execSync('npm run build:prod');
}
