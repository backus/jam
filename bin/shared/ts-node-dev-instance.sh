#!/bin/bash

function ts-node-dev-instance() {
  local inspect_port="$1"
  shift

  ./node_modules/.bin/ts-node-dev \
    --watch "$(git ls-files *.graphql | tr "\n" ",").env" \
    --project tsconfig.json \
    --inspect="127.0.0.1:$inspect_port" \
    --respawn "$@"
}
