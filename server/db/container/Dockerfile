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

COPY etl.sh /docker-entrypoint-initdb.d/etl.sh

COPY init.sh /usr/local/bin/init.sh
RUN chmod +x /usr/local/bin/init.sh

ARG POSTGRES_PASSWORD=postgres
ARG POSTGRES_USER=postgres

ENV POSTGRES_PASSWORD=$POSTGRES_PASSWORD
ENV POSTGRES_USER=$POSTGRES_USER
ENV POSTGRES_INITDB_ARGS="--encoding=UTF-8 --no-locale"

USER $POSTGRES_USER

ENTRYPOINT ["/bin/bash", "/usr/local/bin/init.sh"]
