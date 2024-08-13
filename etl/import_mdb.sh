#!/usr/bin/env bash

export PGDATABASE=elg_search
export PGHOST=localhost
export PGPASSWORD=postgres
export PGPORT=5432
export PGUSER=postgres

MDB=/tmp/elg_database.accdb
SCHEMA=elg_database

# Create the database.
psql -d postgres -c "CREATE DATABASE ${PGDATABASE}"

# Create the schema.
psql -c "DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE"
psql -c "CREATE SCHEMA ${SCHEMA}"

TABLE_NAMES=('1_CFR' '2_Subcategory' '3_Control_Technology' '3a_Control_Technology_Notes' '4_Wastestream_Process' '4A_Technology_Bases' '4B_Technology_Bases' '4C_Technology_Bases_WS' '4C_Technology_Bases_WS_Pollutants' '5_Pollutant_Limitations' '5_Pollutant_Limitations_Range' '5B_Pollutant_LTAs' '5C_Weight_Factors' '5C_Weight_Factors_Pollutants' 'REF_POLLUTANT' 'REF_LIMIT_DURATION' 'REF_LIMIT_UNITS' 'KEY_TTCodes' 'A_CFR_Citation_History' 'A_Definition' 'A_GeneralProvisions' 'A_Source_New' 'KEY_Alt_Lim_Flag' 'REF_NAICS_CODE' 'REF_SIC_CODE' 'REF_PSC_NAICS_XWALK' 'REF_PSC_SIC_XWALK' 'REF_Pollutant_Group' '5D_Pollutant_Groups')

# Create and load all necessary tables.
PIPE=data.csv
mkfifo "$PIPE"
for TABLE_NAME in "${TABLE_NAMES[@]}"; do
    DDL=$(mdb-schema ~/elg_database.accdb postgres \
            | sed -n "/CREATE TABLE IF NOT EXISTS \"${TABLE_NAME}\"/I,/);/p" \
        | sed "s/^CREATE TABLE IF NOT EXISTS \"\([^\"]*\)\"/CREATE TABLE IF NOT EXISTS \"${SCHEMA}\".\"${TABLE_NAME}\"/")
    psql -c "$DDL"

    mdb-export "$MDB" "$TABLE_NAME" > "$PIPE" \
        & psql -c "COPY \"${SCHEMA}\".\"${TABLE_NAME}\" FROM STDIN WITH CSV HEADER" < "$PIPE"
done
rm "$PIPE"
