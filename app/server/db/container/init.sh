#!/usr/bin/env bash
set -Eeo pipefail

# Use the functions of the postgres entrypoint to run files in /always-initdb.d/ then exit.

source "$(which docker-entrypoint.sh)"

docker_setup_env
docker_create_db_directories
# assumption: we are already running as the owner of PGDATA

# This is needed if the container is started as `root`
#if [ "$1" = 'postgres' ] && [ "$(id -u)" = '0' ]; then
#	exec gosu postgres "$BASH_SOURCE" "$@"
#fi

docker_verify_minimum_env
docker_init_database_dir
pg_setup_hba_conf

docker_temp_server_start "$@" -c max_locks_per_transaction=256
docker_setup_db
docker_process_init_files /docker-entrypoint-initdb.d/*
docker_temp_server_stop

# Uncomment to keep the container running.
#exec postgres "$@"
