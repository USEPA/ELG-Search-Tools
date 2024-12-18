#!/bin/bash
set -euo pipefail

DEFAULT_DB=${POSTGRES_DB:-postgres}
MDB=/var/tmp/elg/accdb/elg_database.accdb
PIPE=/tmp/data.csv
SCHEMA=elg_database
SEED_DIR=/var/tmp/elg/seed-data
TABLE_NAMES=('1_CFR' '2_Subcategory' '3_Control_Technology' '3a_Control_Technology_Notes' '4_Wastestream_Process' '4A_Technology_Bases' '4B_Technology_Bases' '4C_Technology_Bases_WS' '4C_Technology_Bases_WS_Pollutants' '5_Pollutant_Limitations' '5_Pollutant_Limitations_Range' '5B_Pollutant_LTAs' '5C_Weight_Factors' '5C_Weight_Factors_Pollutants' 'REF_POLLUTANT' 'REF_LIMIT_DURATION' 'REF_LIMIT_UNITS' 'KEY_TTCodes' 'A_CFR_Citation_History' 'A_Definition' 'A_GeneralProvisions' 'A_Source_New' 'KEY_Alt_Lim_Flag' 'REF_NAICS_CODE' 'REF_SIC_CODE' 'REF_PSC_NAICS_XWALK' 'REF_PSC_SIC_XWALK' 'REF_Pollutant_Group' '5D_Pollutant_Groups')

# Set the environment variables for the database connection.
export PGDATABASE=elg
export PGPASSWORD=${POSTGRES_PASSWORD:-postgres}
export PGUSER=${POSTGRES_USER:-postgres}

# Clean up the pipe on exit.
function cleanup {
    rm -f "$PIPE"
}
trap cleanup SIGINT SIGTERM EXIT

# Join an expanded array by a delimiter.
function join_by { local IFS="$1"; shift; echo "$*"; }

# Create the database (if it doesn't exist).
echo "SELECT 'CREATE DATABASE ${PGDATABASE}' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${PGDATABASE}')\gexec" | psql -d "$DEFAULT_DB"

# Drop and recreate the schema.
psql -c "DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE"
psql -c "CREATE SCHEMA ${SCHEMA}"

# Create and load all necessary tables.
for src_table_name in "${TABLE_NAMES[@]}"; do
    # Convert the table name to lowercase and prepend an 'n' if it starts with a number.
    dst_table_name=$(                     \
            echo "$src_table_name"        \
            | sed "s/^\([0-9]\)/n\1/"     \
            | tr '[:upper:]' '[:lower:]'  \
        )

    # Execute the DDL for the table, inserting the schema and restoring the proper case of the table name.
    ddl=$(                                                                                                                        \
            mdb-schema "$MDB" postgres                                                                                            \
            | sed -n "/CREATE TABLE IF NOT EXISTS \"${src_table_name}\"/I,/);/p"                                                  \
            | sed "s/^CREATE TABLE IF NOT EXISTS \"\([^\"]*\)\"/CREATE TABLE IF NOT EXISTS \"${SCHEMA}\".\"${dst_table_name}\"/"  \
        )
    psql -c "$ddl"

    # Replace spaces, parentheses, and question marks in table names and column names.
    new_columns=()
    psql -tc "SELECT column_name FROM information_schema.columns WHERE table_schema = '${SCHEMA}' AND table_name = '${dst_table_name}'" | while read -r column; do
        new_column=$(echo "$column" | sed -E 's/ /_/g' | sed -E 's/\(/_/g' | sed -E 's/\)/_/g' | sed 's/?/_/g')
        if [ "$column" != "$new_column" ]; then
            psql -c "ALTER TABLE ${SCHEMA}.${dst_table_name} RENAME COLUMN \"$column\" TO $new_column"
        fi
        new_columns+=("$new_column")
    done

    # Export the data from the MDB file, replace the column names, and load the data into the PostgreSQL table.
    mkfifo "$PIPE"
    mdb-export "$MDB" "$src_table_name" | sed "1i\\$(join_by , "${new_columns[@]}")" > "$PIPE" &
    psql -c "COPY \"${SCHEMA}\".\"${dst_table_name}\" FROM STDIN WITH CSV HEADER" < "$PIPE"
    rm -f "$PIPE"
done

# Create the necessary views.
psql -c "\i /var/lib/elg/create_views.sql"

# Create the seed file generation functions.
psql -c "\i /var/lib/elg/create_json_data.sql"

# Create the seed files.
mkdir -p "$SEED_DIR"
psql -c "CALL ${SCHEMA}.generate_seed_files('${SEED_DIR}')"

# Fix escaping in exported files.
for file in "$SEED_DIR"/*.json; do
    sed -i 's/\\\\/\\/g' "$file"
done
