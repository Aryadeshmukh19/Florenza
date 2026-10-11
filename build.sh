#!/usr/bin/env bash
# Florenza build: bundle React + Tailwind into one self-contained page.
set -euo pipefail
cd "$(dirname "$0")"
npx esbuild src/main.jsx --bundle --minify --format=iife --jsx=automatic \
  --loader:.png=dataurl --loader:.jpg=dataurl \
  --define:process.env.NODE_ENV='"production"' --outfile=dist/app.js --log-level=warning
npx tailwindcss -i src/styles.css -o dist/app.css --minify 2>/dev/null
python3 build.py
# Local preview wrapper (the artifact host adds this skeleton itself)
{ echo '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'; cat dist/florenza.html; echo '</body></html>'; } > dist/preview.html
ls -la dist/florenza.html
