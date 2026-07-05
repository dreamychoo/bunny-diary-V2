#!/usr/bin/env bash
# Compress PNG assets with pngquant (visually lossless for illustrations)
set -euo pipefail

SIZES=$(mktemp)
trap 'rm -f "$SIZES"' EXIT

cd "$(dirname "$0")/../public"

echo "=== PNG Asset Compression ==="
echo ""

find . -name "*.png" -not -path "*/extracted-next-to-source/*" -not -path "*/source/*" -not -path "*/_contact*" | while read -r png; do
  # Skip already-compressed (pngquant adds -fs8 suffix, skip originals that were already processed)
  [[ "$png" == *"-fs8.png" ]] && continue

  size_before=$(stat -f%z "$png" 2>/dev/null || stat -c%s "$png" 2>/dev/null)

  # Run pngquant: quality 60-80, speed 1 (best compression), overwrite via --force
  pngquant --quality=60-80 --speed=1 --force --skip-if-larger --output "$png" "$png" 2>/dev/null && {
    size_after=$(stat -f%z "$png" 2>/dev/null || stat -c%s "$png" 2>/dev/null)
    saved=$(( size_before - size_after ))
    pct=$(( 100 - size_after * 100 / size_before ))
    if [ "$saved" -gt 0 ]; then
      echo "  ${png}: $(numfmt --to=iec $size_before 2>/dev/null || echo $size_before) → $(numfmt --to=iec $size_after 2>/dev/null || echo $size_after)  (-${pct}%)"
    fi
  }
done

echo ""
echo "Done."
