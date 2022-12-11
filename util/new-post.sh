#!/bin/sh

cd "$(dirname "$0")/src/new-post" || exit 1

if type deno > /dev/null 2>&1; then
    dart run main.dart "$@"
else
    echo "deno is not installed."
    exit 1
fi
