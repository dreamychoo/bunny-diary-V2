#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE_PATH="${1:-$ROOT_DIR/public/garden-assets/source/bunny-garden-board.png}"
OUTPUT_DIR="${2:-$ROOT_DIR/public/garden-assets/prepped}"
PROFILE_PATH="$ROOT_DIR/tools/asset-profiles/bunny-garden-board.yaml"
ENGINE_DIR="$HOME/.codex/skills/app-asset-prep/scripts"

mkdir -p "$OUTPUT_DIR"

python3 "$ENGINE_DIR/prepare_static_asset.py" \
  "$SOURCE_PATH" \
  --profile "$PROFILE_PATH" \
  --output-dir "$OUTPUT_DIR"

PYTHONPATH="$ENGINE_DIR" python3 - <<'PY' "$OUTPUT_DIR"
from pathlib import Path
import sys

from common_image_ops import create_contact_sheet, load_rgba, save_png

output_dir = Path(sys.argv[1]).resolve()
images = [load_rgba(path) for path in sorted(output_dir.glob("*.png")) if path.name != "_contact-sheet.png"]
sheet = create_contact_sheet(images, columns=4, gap=20)
save_png(sheet, output_dir / "_contact-sheet.png")
print(f"[contact-sheet] {output_dir / '_contact-sheet.png'}")
PY

echo "[done] Bunny Garden assets exported to $OUTPUT_DIR"
