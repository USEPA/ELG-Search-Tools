#!/bin/bash

set -euo pipefail

MDB=/var/tmp/etl/elg_database.accdb
PIPE=data.csv
SCHEMA=elg_database
TABLE_NAMES=('1_CFR' '2_Subcategory' '3_Control_Technology' '3a_Control_Technology_Notes' '4_Wastestream_Process' '4A_Technology_Bases' '4B_Technology_Bases' '4C_Technology_Bases_WS' '4C_Technology_Bases_WS_Pollutants' '5_Pollutant_Limitations' '5_Pollutant_Limitations_Range' '5B_Pollutant_LTAs' '5C_Weight_Factors' '5C_Weight_Factors_Pollutants' 'REF_POLLUTANT' 'REF_LIMIT_DURATION' 'REF_LIMIT_UNITS' 'KEY_TTCodes' 'A_CFR_Citation_History' 'A_Definition' 'A_GeneralProvisions' 'A_Source_New' 'KEY_Alt_Lim_Flag' 'REF_NAICS_CODE' 'REF_SIC_CODE' 'REF_PSC_NAICS_XWALK' 'REF_PSC_SIC_XWALK' 'REF_Pollutant_Group' '5D_Pollutant_Groups')

# Set the environment variables for the database connection.
export PGDATABASE=${POSTGRES_DB:-postgres}
export PGPASSWORD=${POSTGRES_PASSWORD:-postgres}
export PGUSER=${POSTGRES_USER:-postgres}

# Clean up the pipe on exit.
cleanup() {
    rm -f "$PIPE"
}
trap cleanup SIGINT SIGTERM EXIT

# Create the database (if it doesn't exist).
psql -d postgres -c "
  DO \$\$
  BEGIN
     IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_database
        WHERE datname = '${PGDATABASE}'
     ) THEN
        PERFORM dblink_exec('dbname=postgres', 'CREATE DATABASE ${PGDATABASE}');
     END IF;
  END
  \$\$;
"

# Drop and recreate the schema.
psql -c "DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE"
psql -c "CREATE SCHEMA ${SCHEMA}"

# Create and load all necessary tables.
mkfifo "$PIPE"
for TABLE_NAME in "${TABLE_NAMES[@]}"; do
    # Execute the DDL for the table, inserting the schema and restoring the proper case of the table name.
    psql -c "$(mdb-schema ~/elg_database.accdb postgres                                                                     \
        | sed -n "/CREATE TABLE IF NOT EXISTS \"${TABLE_NAME}\"/I,/);/p"                                                    \
        | sed "s/^CREATE TABLE IF NOT EXISTS \"\([^\"]*\)\"/CREATE TABLE IF NOT EXISTS \"${SCHEMA}\".\"${TABLE_NAME}\"/")"

    mdb-export "$MDB" "$TABLE_NAME" > "$PIPE" &
    psql -c "COPY \"${SCHEMA}\".\"${TABLE_NAME}\" FROM STDIN WITH CSV HEADER" < "$PIPE"
done
