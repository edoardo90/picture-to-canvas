#!/usr/bin/env bash
# start.sh — Avvia il dev server locale
set -euo pipefail

cd "$(dirname "$0")/.."

[ -d node_modules ] || { echo "📦 node_modules non trovata, eseguo npm install..."; npm install; }

echo "🚀 Dev server su http://localhost:5173"
npm run dev
