#!/usr/bin/env bash
# Arranca el backend (Node/Express) y el frontend (Vite/React) en paralelo.
# Uso (desde la raíz del repo): bash scripts/dev.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cleanup() {
  [[ -n "${BACK_PID:-}" ]] && kill "$BACK_PID" 2>/dev/null || true
  [[ -n "${FRONT_PID:-}" ]] && kill "$FRONT_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Raíz del proyecto: $ROOT"
echo "Iniciando backend (npm run dev)…"

(cd "$ROOT/backend" && npm run dev) &
BACK_PID=$!

echo "Iniciando frontend (npm run dev)…"

(cd "$ROOT/frontend" && npm run dev) &
FRONT_PID=$!

echo "PIDs: backend=$BACK_PID frontend=$FRONT_PID — Ctrl+C detiene ambos."
wait
