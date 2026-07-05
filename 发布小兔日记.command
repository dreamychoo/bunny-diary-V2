#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
SITE_URL="http://www.mybunnydiary.com"

# Finder 双击打开时 PATH 常常不完整，先补齐常见位置。
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

pause_and_exit() {
  local code="$1"
  echo
  read -r -p "按回车关闭窗口..."
  exit "$code"
}

show_status() {
  if [ -d "$PROJECT_DIR/.git" ]; then
    echo "当前版本："
    git -C "$PROJECT_DIR" status --short --branch || true
    git -C "$PROJECT_DIR" log -1 --oneline || true
    echo
  fi
}

echo
echo "小兔日记 阿里云发布"
echo
echo "项目目录：$PROJECT_DIR"
echo

cd "$PROJECT_DIR"
show_status

if [ "${1:-}" = "--check" ]; then
  echo "开始检查发布配置..."
  if ! bash "$PROJECT_DIR/tools/deploy-aliyun-static.sh" --check; then
    echo
    echo "发布检查失败。"
    pause_and_exit 1
  fi

  echo
  echo "发布配置可用。"
  pause_and_exit 0
fi

echo "开始检查发布配置..."
if ! bash "$PROJECT_DIR/tools/deploy-aliyun-static.sh" --check; then
  echo
  echo "发布检查失败。"
  pause_and_exit 1
fi

echo
echo "开始发布到阿里云..."
if ! bash "$PROJECT_DIR/tools/deploy-aliyun-static.sh"; then
  echo
  echo "发布失败。"
  pause_and_exit 1
fi

echo
echo "发布完成：$SITE_URL"
open "$SITE_URL" || true
pause_and_exit 0
