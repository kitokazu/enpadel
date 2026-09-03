#!/usr/bin/env bash
# Cleans the past-events clip for delivery.
#
# There is no master for this one — public/enpadel-web.mp4 is the only copy —
# so this is a REMUX, not a re-encode: `-c copy` keeps the picture bit-for-bit.
# Re-encoding a 1.97Mbps source could only lose quality and gain bytes.
#
# What it does fix: `-map 0:v:0` drops the leftover iPhone data track and
# `-map_metadata -1` strips the device metadata. The clip has no audio track.
#
# Output goes to public/media/$VER because that whole tree is served with
# `max-age=31536000, immutable` (see next.config.ts).
set -euo pipefail

cd "$(dirname "$0")/.."
SRC="${SRC:-public/enpadel-web.mp4}"
VER="${VER:-v2}"
OUT="${OUT:-public/media/$VER}"

[ -f "$SRC" ] || { echo "missing $SRC" >&2; exit 1; }
mkdir -p "$OUT"
echo "→ source: $SRC → $OUT"
ffprobe -v error -show_entries stream=index,codec_type,codec_name,width,height \
  -of default=noprint_wrappers=1 "$SRC"

echo "→ remuxing video track only"
ffmpeg -y -v error -i "$SRC" -map 0:v:0 -map_metadata -1 -an \
  -c copy -movflags +faststart "$OUT/enpadel-web.mp4"

echo "→ poster"
ffmpeg -y -v error -ss 0.5 -i "$OUT/enpadel-web.mp4" -frames:v 1 \
  -q:v 3 "$OUT/enpadel-poster.jpg"

echo "→ verifying"
printf '%-26s %-6s ' "enpadel-web.mp4" "$(ls -lh "$OUT/enpadel-web.mp4" | awk '{print $5}')"
ffprobe -v error -show_entries stream=index,codec_type,width,height -of csv=p=0:nk=1 \
  "$OUT/enpadel-web.mp4" | tr '\n' ' '
echo
printf '%-26s %s\n' "enpadel-poster.jpg" "$(ls -lh "$OUT/enpadel-poster.jpg" | awk '{print $5}')"
echo "→ done"
