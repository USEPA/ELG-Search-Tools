
**Prerequisites**
- install Node.js from https://nodejs.org
- install postgresql from https://www.postgresql.org/

** Steps to run application locally**
- git clone this repo
- run "npm install" in the base directory to install dependencies from NPM
- run "npm start" to concurrently run the node express server and vue-cli server
- If you prefer to run express and vue-cli in separate terminals, run "npm run server" and "npm run client"
- If you're planning to submit code updates, see [contribute.md](contribute.md).
- For future repo updates, run npm ci from the base directory to ensure dependencies are up to date.

** Commands to fix lint issues **
In the base directory, run:
- npm run lint -- --fix
or 
- npx eslint [path] --fix (for a specific file)
