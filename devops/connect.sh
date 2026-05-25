#!/usr/bin/env bash
# connect-ssh.sh — Apre una sessione SSH sulla VM Oracle Cloud
set -euo pipefail

SSH_KEY="$HOME/.ssh/ssh-key-2026-04-16.key"
REMOTE="ubuntu@130.110.0.127"

[ -f "$SSH_KEY" ] || { echo "ERRORE: chiave SSH non trovata: $SSH_KEY" >&2; exit 1; }

exec ssh -i "$SSH_KEY" "$REMOTE"
