#!/bin/sh


if type dart > /dev/null 2>&1; then
    cd "$(dirname "$0")/new-post" || exit 1
    dart run main.dart "$@"
else
    echo "dart is not installed."
    exit 1
fi
