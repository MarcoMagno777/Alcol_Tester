#!/bin/bash
set -e

cd /app

if [ ! -d node_modules/@angular/core ]; then
  npm install
fi

exec npm run start -- --host 0.0.0.0 --port 5173 --poll 2000
