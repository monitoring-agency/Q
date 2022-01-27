#!/bin/bash

npx babel --watch static/js_src --out-dir static/js --presets react-app/prod --minified --ignore=q_sdk.js

