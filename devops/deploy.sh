#!/usr/bin/env bash
# deploy.sh — Aggiorna picture-to-canvas sulla VM Oracle Cloud
set -euo pipefail

SSH_KEY="$HOME/.ssh/ssh-key-2026-04-16.key"
REMOTE="ubuntu@130.110.0.127"
APP_DIR="/home/ubuntu/picture-to-canvas"

[ -f "$SSH_KEY" ] || { echo "ERRORE: chiave SSH non trovata: $SSH_KEY" >&2; exit 1; }

echo "🚀 Deploy picture-to-canvas..."

ssh -i "$SSH_KEY" "$REMOTE" bash <<ENDSSH
  set -euo pipefail
  cd "$APP_DIR"

  echo "⬇️  git pull..."
  git pull --ff-only

  echo "📦 npm ci..."
  npm ci --prefer-offline

  echo "🔨 npm run build..."
  npm run build

  echo "♻️  reload nginx..."
  sudo systemctl reload nginx

  echo "✅ Deploy completato."
ENDSSH
