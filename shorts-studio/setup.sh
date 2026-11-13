#!/usr/bin/env bash
# Instala todo lo necesario (gratis): voz Kokoro y sus modelos. Requiere Python 3.10-3.13, Node 18+, ffmpeg y Playwright.
set -euo pipefail
cd "$(dirname "$0")"
[ -d .venv ] || python3 -m venv .venv
.venv/bin/pip install -q kokoro-onnx soundfile
mkdir -p models
base=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
[ -f models/kokoro-v1.0.onnx ] || curl -sSL -o models/kokoro-v1.0.onnx $base/kokoro-v1.0.onnx
[ -f models/voices-v1.0.bin ] || curl -sSL -o models/voices-v1.0.bin $base/voices-v1.0.bin
echo "Listo. Prueba: ./make.sh stories/001-la-ultima-galleta.json"
