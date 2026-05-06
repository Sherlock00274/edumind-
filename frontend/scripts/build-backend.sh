#!/bin/zsh
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
FRONTEND_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
ROOT_DIR=$(cd "$FRONTEND_DIR/.." && pwd)
BACKEND_DIR="$ROOT_DIR/backend"
OUTPUT_DIR="$FRONTEND_DIR/.desktop/backend"
WORK_DIR="$BACKEND_DIR/build/pyinstaller"
PYTHON_BIN="$BACKEND_DIR/.venv/bin/python"
PYINSTALLER_CONFIG_DIR="$WORK_DIR/cache"

rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR" "$WORK_DIR" "$PYINSTALLER_CONFIG_DIR"

if [[ ! -x "$PYTHON_BIN" ]]; then
  echo "Missing Python virtualenv at $PYTHON_BIN" >&2
  exit 1
fi

cd "$BACKEND_DIR"
export PYINSTALLER_CONFIG_DIR
"$PYTHON_BIN" -m PyInstaller \
  --noconfirm \
  --clean \
  --onefile \
  --name edumind-backend \
  --paths "$BACKEND_DIR" \
  --distpath "$OUTPUT_DIR" \
  --workpath "$WORK_DIR" \
  --specpath "$WORK_DIR" \
  run_desktop.py
