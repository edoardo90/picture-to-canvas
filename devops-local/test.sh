#!/usr/bin/env bash
# test.sh — Esegue unit test e analisi statica
set -euo pipefail

cd "$(dirname "$0")/.."

[ -d node_modules ] || { echo "📦 node_modules non trovata, eseguo npm install..."; npm install; }

echo "🔍 Type check..."
npx tsc --noEmit

echo "🧪 Unit test..."
npm test

echo "✅ Tutto verde."
