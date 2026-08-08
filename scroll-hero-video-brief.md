# Prompt: regenerate the EN PADEL scroll-scrubbed intro video

Copy everything below the line and hand it to the video-generating agent.

---

Generate the background footage for the scroll-scrubbed intro on the EN PADEL
homepage, then encode it into the four asset files the site loads. The existing
files in `public/` are `scroll-hero-1280.mp4`, `scroll-hero-854.mp4`,
`scroll-hero-loop.mp4` and `scroll-hero-poster.jpg`; the new ones replace them
at the same paths and must keep the same duration and frame rate, because
`src/components/ScrollVideoHero.tsx` maps scroll position onto `video.currentTime`
against a hardcoded 24fps grid and five evenly-spaced text beats.

## What the site is

EN PADEL is a padel social club in Japan. Brand idea is 縁 (*en*) — the
connection between people. Padel is the excuse, the people are the point. So the
footage is not a sports highlight reel: it opens on play and ends on a party.
Tone is warm, sunlit, premium-casual, real people rather than models. Deep green
and off-white palette, hard midday sun, real depth of field.

## Hard spec

- **Duration: exactly 10.000s.** Not 9.8, not 10.2.
- **Frame rate: 24fps constant.** 240 frames.
- **Resolution: 1280x720 or larger, 16:9 landscape.** Downscales are made later.
- **One continuous take. No cuts, no dissolves, no shot changes, no speed ramps.**
  This is the single most important constraint. The viewer drags this footage
  back and forth with their scroll wheel; a cut mid-clip reads as a broken player,
  not as editing.
- **Camera motion is monotonic** — one smooth push/glide travelling in a single
  direction. No whip-backs, no returning to a previous position, no orbit that
  passes the same spot twice. If the camera reverses, scrolling down looks like
  scrolling up.
- **Even motion speed.** No section should be nearly static while another rips
  past, or the scroll will feel like it snags.
- **No burned-in text, logos, captions, watermarks, sparkle overlays or letterboxing.**
  All type is HTML on top. (The current clip has an AI sparkle watermark in the
  lower right — do not reproduce it.)
- **No hard flash frames or strobing**, and no shot that goes to near-black or
  near-white; a scrim and a shade gradient sit over this footage and blown
  highlights kill the text contrast.
- Silent. Audio is stripped.

## The move, beat by beat

A single steadicam-style glide that starts behind a padel match and ends at the
DJ booth on the lawn, as if one person walked off the court and into the party.
Each beat below is 2 seconds of the 10 and carries one text block, so the
composition note for each is a requirement, not a suggestion.

| Time | Content | Composition requirement |
|---|---|---|
| 0.0–2.0s | Doubles padel point in progress, seen from behind the glass back wall. Blue court, black mesh cage, yellow posts, trees and blue sky beyond. | Subjects pushed to the **edges of frame**. The centre must stay open court — a large centred title lands here. |
| 2.0–4.0s | Camera glides laterally past the court, along the cage. Court largely empty in frame. | **Centre stays clean and relatively quiet.** A single very large 縁 character sits dead centre here. |
| 4.0–6.0s | Camera clears the cage onto the grass; two or three people sitting courtside on a bench talking, rackets down, mid-conversation. | People occupy the **right two-thirds**. The **left third must stay dark and uncluttered** (cage, shade, foliage). Type goes there. |
| 6.0–8.0s | Into the social area on the lawn — a woman laughing mid-conversation in the near foreground, groups with drinks behind her, umbrellas, shallow depth of field. | Subject **right of centre**. Left side holds a smaller caption block. |
| 8.0–10.0s | Ends on the DJ booth: a DJ in headphones working CDJs under an umbrella, party continuing behind. Settles to a near-stop on the last frame. | DJ **centre or right**. The **lower-left quadrant must stay clear** — the call-to-action button sits there. Final frame should be a composition that holds still, since scroll rests on it. |

Shoot/generate it as one flowing move through those five moments — the table is
where the camera *is* at each second, not five separate clips.

## Grade

Sunlit and warm but not orange. Greens stay green. Mild film grain is fine (the
page adds its own grain layer on top). Keep midtones a little low; the site
darkens this footage further and text is set in off-white over it.

## Encoding — do this after generating, exactly

Save the raw generated clip as `public/ai_video_test.mp4` (replacing the current
one), then produce the four delivery assets. The scrub tiers **must be encoded
with every frame as a keyframe** (`-g 1`); this is what makes the scrubbing
smooth. A normal GOP here means every seek decodes from frame zero and the
intro judders.

```bash
cd public

# Scrub tier, desktop >1100px. All-keyframe.
ffmpeg -y -i ai_video_test.mp4 -an -vf "scale=1280:720:flags=lanczos,fps=24" \
  -c:v libx264 -preset slow -crf 20 -g 1 -keyint_min 1 -sc_threshold 0 \
  -pix_fmt yuv420p -movflags +faststart scroll-hero-1280.mp4

# Scrub tier, narrower desktops. All-keyframe.
ffmpeg -y -i ai_video_test.mp4 -an -vf "scale=854:480:flags=lanczos,fps=24" \
  -c:v libx264 -preset slow -crf 22 -g 1 -keyint_min 1 -sc_threshold 0 \
  -pix_fmt yuv420p -movflags +faststart scroll-hero-854.mp4

# Loop tier: phones, reduced motion, save-data. Never seeked, so normal GOP.
# Must stay under ~800KB — it is fetched on every mobile page view.
ffmpeg -y -i ai_video_test.mp4 -an -vf "scale=854:480:flags=lanczos,fps=24" \
  -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p \
  -movflags +faststart scroll-hero-loop.mp4

# Poster: first frame, shown until the video paints.
ffmpeg -y -i ai_video_test.mp4 -vf "scale=1280:720:flags=lanczos" \
  -frames:v 1 -q:v 4 scroll-hero-poster.jpg
```

Then verify and report:

```bash
for f in scroll-hero-1280.mp4 scroll-hero-854.mp4 scroll-hero-loop.mp4; do
  ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate \
    -of default=noprint_wrappers=1 "$f"
  ls -lh "$f"
done
```

Duration must read `10.0` and frame rate `24/1` on all three. If the generated
clip comes back at a different length, retime it to exactly 10s at 24fps before
encoding rather than changing `FPS` in the component.

## Do not touch

`ScrollVideoHero.tsx`, `globals.css`, or the panel copy in
`src/app/[locale]/page.tsx`. This task replaces media only. If the footage
genuinely cannot satisfy a composition requirement above, say so instead of
adjusting the text placement to fit.
