#!/usr/bin/env bash
# Encodes the four scroll-hero delivery assets from public/ai_video_test.mp4,
# stripping the generator's sparkle watermark on the way.
#
# The watermark is a static 4-point sparkle at roughly x1137-1185, y577-623 in
# the 1280x720 master, so delogo (which interpolates from the box edges) removes
# it cleanly. It runs BEFORE scale so the box coordinates stay in native space,
# and it is applied per-output rather than to an intermediate file so nothing
# takes a second generation of compression.
set -euo pipefail

cd "$(dirname "$0")/.."
SRC="${SRC:-public/ai_video_test.mp4}"
OUT="${OUT:-public}"
DELOGO="delogo=x=1134:y=574:w=54:h=52"

[ -f "$SRC" ] || { echo "missing $SRC" >&2; exit 1; }
echo "→ source: $SRC"
ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate \
  -of default=noprint_wrappers=1 "$SRC"

# Scrub tiers are all-keyframe (-g 1): the component seeks these every frame and
# a normal GOP would decode from frame zero on every seek.
# CRF is tuned so the all-keyframe tiers land near the sizes the committed
# assets had (5.3M / 2.4M). -g 1 inflates a file several times over, so the
# usual crf 20-22 that would be fine for a normal GOP is far too generous here.
echo "→ scrub tier 1280"
ffmpeg -y -v error -i "$SRC" -an -vf "$DELOGO,scale=1280:720:flags=lanczos,fps=24" -t 10 \
  -c:v libx264 -preset slow -crf 25 -g 1 -keyint_min 1 -sc_threshold 0 \
  -pix_fmt yuv420p -movflags +faststart "$OUT/scroll-hero-1280.mp4"

echo "→ scrub tier 854"
ffmpeg -y -v error -i "$SRC" -an -vf "$DELOGO,scale=854:480:flags=lanczos,fps=24" -t 10 \
  -c:v libx264 -preset slow -crf 28 -g 1 -keyint_min 1 -sc_threshold 0 \
  -pix_fmt yuv420p -movflags +faststart "$OUT/scroll-hero-854.mp4"

# Never seeked, so a normal GOP is fine and much smaller. Keep under ~800KB:
# it is fetched on every mobile page view.
echo "→ loop tier"
ffmpeg -y -v error -i "$SRC" -an -vf "$DELOGO,scale=854:480:flags=lanczos,fps=24" -t 10 \
  -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p \
  -movflags +faststart "$OUT/scroll-hero-loop.mp4"

echo "→ poster"
ffmpeg -y -v error -i "$SRC" -vf "$DELOGO,scale=1280:720:flags=lanczos" -frames:v 1 \
  -q:v 4 "$OUT/scroll-hero-poster.jpg"

echo "→ verifying"
for f in scroll-hero-1280.mp4 scroll-hero-854.mp4 scroll-hero-loop.mp4; do
  printf '%-24s %-6s ' "$f" "$(ls -lh "$OUT/$f" | awk '{print $5}')"
  ffprobe -v error -show_entries format=duration:stream=width,height,nb_frames \
    -of csv=p=0:nk=1 "$OUT/$f" | tr '\n' ' '
  echo
done
printf '%-24s %s\n' scroll-hero-poster.jpg "$(ls -lh "$OUT/scroll-hero-poster.jpg" | awk '{print $5}')"
echo "→ done"
