#!/usr/bin/env bash

mkdir -p /var/www/html/static
cp -r css/ /var/www/html/static
cp -r img/ /var/www/html/static
cp index.html /var/www/html/
/bin/bash start_jsx_transpiler.sh
cp -r js/ /var/www/html/static
mkdir -p /var/www/html/static/utils
cp js_src/utils/q_sdk.js /var/www/html/static/utils/
