FROM postgres:14

RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

RUN DEBIAN_FRONTEND=noninteractive apt-get update  \
  && apt-get install -y --no-install-recommends    \
    apt-utils                                      \
    ca-certificates                                \
  && rm -rf /var/lib/apt/lists/*

RUN DEBIAN_FRONTEND=noninteractive apt-get update  \
  && apt-get install -y --no-install-recommends    \
    mdbtools                                       \
    sed                                            \
  && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /var/lib/elg
COPY create_json_data.sql /var/lib/elg/create_json_data.sql
COPY create_views.sql /var/lib/elg/create_views.sql

COPY etl.sh /usr/local/bin/etl.sh
RUN chmod +x /usr/local/bin/etl.sh

ARG POSTGRES_PASSWORD=postgres
ARG POSTGRES_USER=postgres

ENV POSTGRES_PASSWORD=$POSTGRES_PASSWORD
ENV POSTGRES_USER=$POSTGRES_USER
ENV POSTGRES_INITDB_ARGS="--no-locale"

USER $POSTGRES_USER
RUN mkdir -p /var/tmp/elg/accdb /var/tmp/elg/seed-data /var/tmp/elg/pgdb

ENTRYPOINT ["/bin/bash", "/usr/local/bin/etl.sh"]
