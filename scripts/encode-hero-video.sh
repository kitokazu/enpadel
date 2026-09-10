#!/usr/bin/env bash
# Encodes the scroll-hero delivery assets from public/ai_video_test.mp4,
# stripping the generator's sparkle watermark on the way.
#
# The watermark is a static 4-point sparkle at roughly x1137-1185, y577-623 in
# the 1280x720 master, so delogo (which interpolates from the box edges) removes
# it cleanly. It runs BEFORE scale so the box coordinates stay in native space,
# and it is applied per-output rather than to an intermediate file so nothing
# takes a second generation of compression.
#
# Output goes to public/media/$VER because that whole tree is served with
# `max-age=31536000, immutable` (see next.config.ts). Bump VER and update the
# paths in src/components/ScrollVideoHero.tsx whenever the footage changes.
set -euo pipefail

cd "$(dirname "$0")/.."
SRC="${SRC:-public/ai_video_test.mp4}"
VER="${VER:-v2}"
OUT="${OUT:-public/media/$VER}"
DELOGO="delogo=x=1134:y=574:w=54:h=52"

[ -f "$SRC" ] || { echo "missing $SRC" >&2; exit 1; }
mkdir -p "$OUT"
echo "→ source: $SRC → $OUT"
ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate \
  -of default=noprint_wrappers=1 "$SRC"

# Scrub tiers are all-keyframe (-g 1): the component seeks these every frame and
# a normal GOP would decode from frame zero on every seek.
#
# 12fps, not 24. The scrub ties frames to scroll distance, not to time, so half
# the frames are invisible to the viewer — and halving the frame count is what
# pays for the much lower CRF. Same bytes, visibly better picture. FPS in
# ScrollVideoHero.tsx must match.
echo "→ scrub tier 1280 (12fps, all-intra)"
ffmpeg -y -v error -i "$SRC" -an -vf "$DELOGO,scale=1280:720:flags=lanczos,fps=12" -t 10 \
  -c:v libx264 -preset veryslow -crf 22 -g 1 -keyint_min 1 -sc_threshold 0 \
  -pix_fmt yuv420p -movflags +faststart "$OUT/scroll-hero-1280.mp4"

echo "→ scrub tier 854 (12fps, all-intra)"
ffmpeg -y -v error -i "$SRC" -an -vf "$DELOGO,scale=854:480:flags=lanczos,fps=12" -t 10 \
  -c:v libx264 -preset veryslow -crf 25 -g 1 -keyint_min 1 -sc_threshold 0 \
  -pix_fmt yuv420p -movflags +faststart "$OUT/scroll-hero-854.mp4"

# The loop tier is actually PLAYED, not seeked, so it keeps 24fps — 12fps looks
# choppy in real playback — and a normal GOP, which is far smaller.
# Keep under ~800KB: it is fetched on every reduced-motion / save-data view.
echo "→ loop tier (24fps, normal GOP)"
ffmpeg -y -v error -i "$SRC" -an -vf "$DELOGO,scale=854:480:flags=lanczos,fps=24" -t 10 \
  -c:v libx264 -preset veryslow -crf 30 -pix_fmt yuv420p \
  -movflags +faststart "$OUT/scroll-hero-loop.mp4"

# Poster is frame 0 of the same encode, so there is no jump when the video paints.
echo "→ poster"
ffmpeg -y -v error -ss 0 -i "$OUT/scroll-hero-1280.mp4" -frames:v 1 \
  -q:v 3 "$OUT/scroll-hero-poster.jpg"

echo "→ verifying"
for f in "scroll-hero-1280.mp4" "scroll-hero-854.mp4" "scroll-hero-loop.mp4"; do
  printf '%-28s %-6s ' "$f" "$(ls -lh "$OUT/$f" | awk '{print $5}')"
  ffprobe -v error -show_entries format=duration -show_entries stream=width,height,avg_frame_rate,nb_frames \
    -of csv=p=0:nk=1 "$OUT/$f" | tr '\n' ' '
  echo
done
printf '%-28s %s\n' "scroll-hero-poster.jpg" "$(ls -lh "$OUT/scroll-hero-poster.jpg" | awk '{print $5}')"
echo "→ done"
