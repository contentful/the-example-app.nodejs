#!/bin/bash

export PATH="$PATH:/usr/local/bin"
export USERID=$(id -u)
export GROUPID=$(id -g)
echo "Running as UID=$USERID, GID=$GROUPID"
cd $(dirname $0)

docker-compose -f test-bed.yml run --rm -w "$WORKSPACE" --entrypoint "SBI/test.sh" rcx-bi
