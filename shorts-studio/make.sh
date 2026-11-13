#!/usr/bin/env bash
# Genera un short completo a partir de una historia: voz + música + animación -> out/<id>.mp4
# Uso: ./make.sh stories/001-la-ultima-galleta.json [--preview]
set -euo pipefail
cd "$(dirname "$0")"
story="$1"; shift || true
.venv/bin/python scripts/tts.py "$story"
node scripts/render.mjs "$story" "$@"
