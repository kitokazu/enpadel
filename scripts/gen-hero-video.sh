#!/usr/bin/env bash
# Generates the scroll-scrubbed intro footage via fal.ai and encodes the four
# delivery assets. See scroll-hero-video-brief.md for the spec this implements.
#
#   ./scripts/gen-hero-video.sh                 # generate + encode
#   ./scripts/gen-hero-video.sh --raw-only      # generate, skip the ffmpeg step
#   ./scripts/gen-hero-video.sh --resume <id>   # attach to an in-flight request
set -euo pipefail

cd "$(dirname "$0")/.."
set -a; . ./.env.local; set +a
: "${FAL_KEY:?FAL_KEY missing from .env.local}"

RESUME_ID=""
if [ "${1:-}" = "--resume" ]; then
  RESUME_ID="${2:?--resume needs a request_id}"; shift 2
fi

MODEL="fal-ai/kling-video/v2.5-turbo/pro/text-to-video"
# Queue paths key off the top-level app namespace, not the full model path.
QUEUE_BASE="fal-ai/kling-video"
OUT_DIR="${OUT_DIR:-public}"
RAW="${RAW:-$OUT_DIR/ai_video_test.mp4}"

read -r -d '' PROMPT <<'EOF' || true
Single continuous steadicam shot with no cuts. A sunlit outdoor padel club on a
clear summer day. The camera glides smoothly forward and to the right in one
unbroken direction at a constant even speed. It begins behind the glass back
wall of a blue padel court where four players in white sportswear are mid-rally,
the players spread to the left and right edges of the frame with open blue court
in the centre. It drifts laterally along the black mesh cage past the empty end
of the court. It clears the cage onto green lawn where two people sit on a
courtside bench talking with rackets down, positioned in the right two thirds of
frame while dark shaded fencing fills the left third. It continues into a social
area where people stand holding drinks under cream canvas umbrellas, and a woman
in a white top laughs mid conversation in the near foreground just right of
centre, shallow depth of field. It settles to a near stop on a DJ wearing
headphones working a CDJ setup under an umbrella, the party continuing behind
him. Warm midday sunlight, deep green foliage, off-white clothing, premium
casual, documentary realism, natural skin tones, shallow depth of field, subtle
film grain. The camera never reverses direction and never returns to a previous
position.
EOF

read -r -d '' NEGATIVE <<'EOF' || true
cuts, jump cuts, scene changes, camera reversing direction, camera shake, speed
ramp, text, captions, subtitles, watermark, logo, sparkle overlay, letterboxing,
black bars, strobing, flashing, blown highlights, pure black frames, cartoon,
illustration, distorted faces, extra limbs, blur, low quality
EOF

if [ -n "$RESUME_ID" ]; then
  REQ_ID="$RESUME_ID"
  echo "→ resuming request: $REQ_ID"
  STATUS_URL="https://queue.fal.run/$QUEUE_BASE/requests/$REQ_ID/status"
  RESULT_URL="https://queue.fal.run/$QUEUE_BASE/requests/$REQ_ID"
else
  echo "→ submitting to $MODEL"
  SUBMIT=$(jq -n --arg p "$PROMPT" --arg n "$NEGATIVE" \
    '{prompt:$p, negative_prompt:$n, duration:"10", aspect_ratio:"16:9", cfg_scale:0.5}' \
    | curl -sS -X POST "https://queue.fal.run/$MODEL" \
        -H "Authorization: Key $FAL_KEY" \
        -H "Content-Type: application/json" -d @-)

  REQ_ID=$(jq -r '.request_id // empty' <<<"$SUBMIT")
  if [ -z "$REQ_ID" ]; then
    echo "submit failed:" >&2; jq . <<<"$SUBMIT" >&2; exit 1
  fi
  echo "→ request_id: $REQ_ID"

  # Use the URLs fal hands back rather than building them from $MODEL: a URL
  # constructed from the full model path 405s.
  STATUS_URL=$(jq -r '.status_url' <<<"$SUBMIT")
  RESULT_URL=$(jq -r '.response_url' <<<"$SUBMIT")
fi

for _ in $(seq 1 120); do
  S=$(curl -sS "$STATUS_URL" -H "Authorization: Key $FAL_KEY" | jq -r '.status // "?"')
  echo "   [$(date +%H:%M:%S)] $S"
  [ "$S" = "COMPLETED" ] && break
  case "$S" in
    FAILED|ERROR|CANCELLED)
      curl -sS "$RESULT_URL" -H "Authorization: Key $FAL_KEY" | jq . >&2; exit 1 ;;
    "?"|"")
      echo "unexpected status response from $STATUS_URL" >&2; exit 1 ;;
  esac
  sleep 10
done

RESULT=$(curl -sS "$RESULT_URL" -H "Authorization: Key $FAL_KEY")
VIDEO_URL=$(jq -r '.video.url // empty' <<<"$RESULT")
if [ -z "$VIDEO_URL" ]; then
  echo "no video in result:" >&2; jq . <<<"$RESULT" >&2; exit 1
fi

echo "→ downloading $VIDEO_URL"
curl -sSL "$VIDEO_URL" -o "$RAW"
ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate \
  -of default=noprint_wrappers=1 "$RAW"

[ "${1:-}" = "--raw-only" ] && { echo "→ raw saved to $RAW"; exit 0; }

# Retime to exactly 10.000s at 24fps regardless of what came back, then encode.
# The scrub tiers are all-keyframe (-g 1): the component seeks these every frame
# and a normal GOP means each seek decodes from frame zero.
echo "→ encoding delivery assets"
ffmpeg -y -v error -i "$RAW" -an -vf "scale=1280:720:flags=lanczos,fps=24" -t 10 \
  -c:v libx264 -preset slow -crf 20 -g 1 -keyint_min 1 -sc_threshold 0 \
  -pix_fmt yuv420p -movflags +faststart "$OUT_DIR/scroll-hero-1280.mp4"

ffmpeg -y -v error -i "$RAW" -an -vf "scale=854:480:flags=lanczos,fps=24" -t 10 \
  -c:v libx264 -preset slow -crf 22 -g 1 -keyint_min 1 -sc_threshold 0 \
  -pix_fmt yuv420p -movflags +faststart "$OUT_DIR/scroll-hero-854.mp4"

ffmpeg -y -v error -i "$RAW" -an -vf "scale=854:480:flags=lanczos,fps=24" -t 10 \
  -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p \
  -movflags +faststart "$OUT_DIR/scroll-hero-loop.mp4"

ffmpeg -y -v error -i "$RAW" -vf "scale=1280:720:flags=lanczos" -frames:v 1 \
  -q:v 4 "$OUT_DIR/scroll-hero-poster.jpg"

echo "→ done"
for f in scroll-hero-1280.mp4 scroll-hero-854.mp4 scroll-hero-loop.mp4 scroll-hero-poster.jpg; do
  printf '%s  ' "$(ls -lh "$OUT_DIR/$f" | awk '{print $5}')"
  echo "$f"
done
