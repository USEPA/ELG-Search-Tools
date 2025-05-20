# Local Development Setup

## Prerequisites

- Install Node.js from https://nodejs.org
- Install PostgreSQL from https://www.postgresql.org/

## Steps to Run Locally

- `git clone` this repo.
- In the app/client directory, copy `.env.example` to `.env`
- In the app/server directory, copy `.env.example` to `.env`, modifying the `DB_USER` & `DB_PASS` variables as needed for your PostgreSQL superuser.
- Run `npm run setup` in the app/server directory to install dependencies from NPM and create/seed the database.
- Run `npm start` from the app directory to concurrently run the node express server and vue-cli server.
  - If you prefer to run express and vite in separate terminals, run `npm run server` and `npm run client`.
- If you're planning to submit code updates, see [contribute.md](contribute.md).
- For future repo updates, run `npm ci` from the base directory to ensure dependencies are up to date.

## Commands to Fix Lint Issues

In the app/server and app/client directories, run:

```
npm run lint -- --fix
```

or, for a specific file:

```
npx eslint [path] --fix
```
