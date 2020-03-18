const { execSync } = require('child_process');

if (process.env.NODE_ENV === 'local') {
  execSync('npm run build:dev');
} else {
  // run production build
  execSync('npm run build:prod');
}
