#!/bin/bash

database="Cleangenix DB"

if psql -U postgres -t -c '\du' | cut -d \| -f 1 | grep -qw me;
then
	echo "Role 'me' already exists with password 'MYPASS123'"
else
	psql -U postgres -c "CREATE USER me WITH SUPERUSER PASSWORD 'MYPASS123';"
	echo "Created role 'me' with password 'MYPASS123'"
fi

echo "Configuring $database"

if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw cleangenix_sdb;
then
    echo "Droping $database"
	dropdb -U me cleangenix_sdb
fi

echo "Recreating $database"
createdb -U me cleangenix_sdb

echo "Adding tables to $database"
psql -U me cleangenix_sdb < ./bin/sql/cleangenix_sdb.sql

echo "$database configured"