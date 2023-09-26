#!/bin/sh

if type deno > /dev/null 2>&1; then
    cd "$(dirname "$0")/generate_simple_html_files" || exit 1
    deno run --allow-read --allow-write main.ts
else
    echo "deno is not installed."
    exit 1
fi
