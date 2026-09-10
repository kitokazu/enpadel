#!/usr/bin/env bash
# Builds the two subset font files that app/[locale]/opengraph-image.tsx feeds
# to satori. Run by hand; the output is committed.
#
# Why subsets: satori cannot use woff2, and the OG card only ever sets a handful
# of characters. Shipping the full Zen Old Mincho (5.5MB of Japanese) to render
# one line would slow every OG render for nothing.
#
set -euo pipefail

cd "$(dirname "$0")/.."
OUT="src/assets/fonts"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"

RAW="https://raw.githubusercontent.com/google/fonts/main/ofl"

# Every character the two cards can set. Keep in sync with the copy in
# src/lib/content.ts (meta.ogEyebrow / meta.ogTagline).
LATIN=' !"#&'"'"'(),-.0123456789:;?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz·×'
JP='縁プレイを通じて、つながる。年設立東京都パデルコミュニティ出会関係性大切・'

echo "→ downloading"
curl -sSfL "$RAW/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf" -o "$TMP/cg-var.ttf"
curl -sSfL "$RAW/shipporimincho/ShipporiMincho-Regular.ttf" -o "$TMP/sm.ttf"

# Google ships Cormorant Garamond only as a variable font, and satori renders a
# variable font at its DEFAULT instance rather than the weight you ask for.
# Pinning wght=400 first makes the static file explicit. Shippori Mincho is
# already static, so it goes straight to the subsetter.
echo "→ pinning Cormorant Garamond to wght=400"
python3 -m fontTools.varLib.instancer "$TMP/cg-var.ttf" wght=400 -o "$TMP/cg-400.ttf" >/dev/null

echo "→ subsetting"
pyftsubset "$TMP/cg-400.ttf" --text="$LATIN" --layout-features='' \
  --output-file="$OUT/CormorantGaramond-400.subset.ttf"
pyftsubset "$TMP/sm.ttf" --text="$JP" --layout-features='' \
  --output-file="$OUT/ShipporiMincho-400.subset.ttf"

ls -lh "$OUT"
