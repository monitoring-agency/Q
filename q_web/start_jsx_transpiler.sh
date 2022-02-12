#!/bin/bash

npx babel js_src --out-dir js --presets react-app/prod --minified --ignore=q_sdk.js

