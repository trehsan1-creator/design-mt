#!/usr/bin/env bash
set -euo pipefail

PYFTSUBSET="/tmp/pyvenv/bin/pyftsubset"
OUT_DIR="public/fonts"
mkdir -p "$OUT_DIR"

UNICODES="U+0020-00FF,U+0600-06FF,U+0750-077F,U+08A0-08FF,U+2000-206F,U+2190-21FF,U+2200-22FF,U+25A0-25FF,U+FB50-FDFF,U+FE70-FEFF"

declare -A MAP=(
  ["peyda-300.woff2"]="peyda/peyda-light.ttf"
  ["peyda-400.woff2"]="peyda/Peyda-Regular.ttf"
  ["peyda-500.woff2"]="peyda/Peyda-Medium.ttf"
  ["peyda-600.woff2"]="peyda/Peyda-SemiBold.ttf"
  ["peyda-700.woff2"]="peyda/Peyda-Bold.ttf"
  ["peyda-800.woff2"]="peyda/Peyda-ExtraBold.ttf"
  ["peyda-900.woff2"]="peyda/Peyda-Black.ttf"
)

for out in "${!MAP[@]}"; do
  src="${MAP[$out]}"
  "$PYFTSUBSET" "$src" \
    --output-file="$OUT_DIR/$out" \
    --flavor=woff2 \
    --unicodes="$UNICODES" \
    --layout-features='*' \
    --no-hinting \
    --desubroutinize
done

ls -lh "$OUT_DIR"
du -sk "$OUT_DIR"
