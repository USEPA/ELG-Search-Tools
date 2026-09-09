# Database

The source of truth for ELG data is an MS Access file. Postgres is loaded from it by the ETL in
`container/`, and the full text search tables are built on top afterwards.

## Contents

| Path | Purpose |
| --- | --- |
| `container/` | ETL - converts `elg_database.accdb` into the `elg_database` schema and writes the seed JSON |
| `elg_keyword_search_vectors.sql` | Builds the keyword search tables. Run after seeding |
| `truncate_elg_search.sql` | Empties every table in the `elg_search` schema |

## Loading the database

**1. Provide the Access file and container env.**

Put the Access database at `container/accdb/elg_database.accdb`, and copy `container/.env.example`
to `container/.env`.

**2. Run the ETL.** From `app/server`:

```sh
npm run etl
```

This brings up the container, moves the generated JSON into `src/seeders/data`, then runs
`npm run migrate` and `npm run seed`. Note that `migrate` is `db:migrate:undo:all && db:migrate`, so
every table is dropped and recreated - seeding always starts from empty tables.

**3. Build the keyword search tables.** These are not covered by migrations or seeders, so this step
is separate and easy to forget:

```sh
psql -d "$DB_NAME" -f db/elg_keyword_search_vectors.sql
```

It depends on `elg_search."ViewLimitationKeywordSearch"`, created by a migration in step 2, and
rebuilds:

- `LimitationKeywordSearch` - the tsvector columns the keyword search matches against (~1.5 GB, so
  this takes a few minutes)
- `PointSourceCategoryLexeme` - maps each lexeme back to the words that produced it, so results
  pages can highlight the word actually present in the text

These are tables, not views, so **re-run this step whenever the underlying data changes** or the
keyword search will serve stale results.

## About `truncate_elg_search.sql`

Not part of the flow above - step 2 already drops and recreates every table. It is kept for
emptying the schema without running a full migrate cycle.
