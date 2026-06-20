#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"

pick_file() {
  osascript <<'APPLESCRIPT'
POSIX path of (choose file with prompt "选择要提取素材的图片")
APPLESCRIPT
}

compute_output_dir() {
  python3 - "$1" <<'PY'
from pathlib import Path
import sys

input_path = Path(sys.argv[1]).expanduser().resolve()
output_dir = input_path.parent / "extracted-next-to-source" / input_path.stem
print(output_dir)
PY
}

INPUT_PATH="${1:-}"

if [ -z "$INPUT_PATH" ]; then
  INPUT_PATH="$(pick_file || true)"
fi

if [ -z "$INPUT_PATH" ]; then
  echo
  echo "没有选择图片，已取消。"
  read -r -p "按回车关闭窗口..."
  exit 0
fi

echo
echo "开始提取素材："
echo "$INPUT_PATH"
echo

npm --prefix "$PROJECT_DIR" run asset:extract -- "$INPUT_PATH" --save-preview

OUTPUT_DIR="$(compute_output_dir "$INPUT_PATH")"

echo
echo "输出目录："
echo "$OUTPUT_DIR"
echo

if [ -d "$OUTPUT_DIR" ]; then
  open "$OUTPUT_DIR"
fi

read -r -p "处理完成，按回车关闭窗口..."
