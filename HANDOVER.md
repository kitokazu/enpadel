# Handover — site fix pass, August 2026

Branch: **`site-fixes-2026-08`**, branched from `main` at `cd52c08`. **Nothing is
committed.** Everything below is in the working tree.

This implements the audit in the site-fix spec (OG cards, per-locale metadata,
Japanese typography, type scale, video, caching, layout bugs), plus follow-on
work the client asked for during the pass.

Verify with `node scripts/verify-type.mjs` (see [Verifying](#verifying)) before
and after any change to type or fonts. Several bugs here looked correct in the
stylesheet and wrong in the browser.

---

## 1. The type system — read this before touching CSS

Two rules carry the whole thing. Both are load-bearing; breaking either
reintroduces a bug that was expensive to find.

### Faces are assigned by role, not by taste

```
--stack-display   wordmark, h1/h2, card titles, big numerals, contact email,
                  event values.        Things you look AT.
--stack-text      sublines, taglines, captions, body, labels, controls.
                  Things you READ.
```

| | Latin | Japanese |
|---|---|---|
| display | Cormorant Garamond | Shippori Mincho |
| text | DM Sans | Zen Kaku Gothic New |

Latin sits first in each stack and Japanese second, so ASCII resolves to the
Latin face and only Japanese falls through. The OS names and the terminating
generic live at the tail of the two **JP** variables (set in
`app/[locale]/layout.tsx`), never in the Latin ones — see §3.1 for why that
matters more than it looks.

Client history, so nobody re-litigates it: the Latin pair was trialled against
four alternatives and the client chose to keep Cormorant + DM Sans. The
Japanese pair is a change from the original site (which loaded no Japanese
webfont at all) and the client explicitly approved it. **Do not swap the
Japanese faces without asking.**

### Nothing is italic, and there are two weights

- **No `font-style: italic` anywhere.** Cormorant's italic used to carry
  sublines, captions and pull-quotes in eight separate places, which made a
  two-face pairing read as four. Emphasis is weight 500 or colour, never slant.
  This is also the permanent fix for Japanese: no JP face has an italic, so the
  browser synthesises one by skewing glyphs, and sixteen strings on `/ja` were
  getting it.
- **400 and 500 only.** No 300, no 700. The italic and 300 faces are not even
  loaded, so a stray `font-style: italic` in one component fails loudly instead
  of quietly working.

### The scale

Nine tokens in `:root`. Every computed size on the page resolves to one of
them, with two deliberate exceptions: the 縁 ornament (`--t-mark`) and the `×`
divider in the event lockup, which is `0.4em` of its parent by design.

```
--t-display  --t-mark  --t-h1  --t-h2  --t-h3
--t-lead  --t-body(16)  --t-action(13)  --t-eyebrow(12)  --t-small(15)
```

`--t-action` exists separately from `--t-eyebrow` because a label and a button
are not the same job: an eyebrow is read once at a glance, a control has to be
hittable. Don't merge them back.

`html:lang(ja)` **redefines tokens** rather than writing per-component rules —
line-heights, tracking, and `--t-eyebrow` (Japanese eyebrows are larger and not
uppercased, since `text-transform` does nothing useful to kana). See §3.3 for
why it must be done this way.

---

## 2. What changed, by area

### Share cards and metadata
- `app/[locale]/opengraph-image.tsx` + `twitter-image.tsx` generate a
  1200×630 card per locale via `ImageResponse`, prerendered at build time.
  `generateImageMetadata` gives each locale its own `og:image:alt`.
- Per-locale `<title>`, description, canonical, `og:*`, `twitter:*`, and both
  `hreflang` alternates plus `x-default`. `/ja` previously served the English
  title and description and had no share tags at all.
- Copy lives in `meta` in `src/lib/content.ts`, so the card and the page read
  the same strings.

### Japanese
- Zero italics on `/ja` (was 16).
- Japanese webfonts actually load (the site previously fell back to whatever
  the OS supplied, so `/ja` rendered differently on every machine).
- `font-feature-settings: "palt"`, `line-break: strict`, `text-spacing-trim`.
- English footer no longer ends with an untranslated Japanese fragment.

### Type
- 52 distinct type styles → 9 tokens. Eyebrows: 11 sizes and 8 trackings → one.
- Nav had three treatments in one component → one.
- `<h4>` in the footer was inheriting bold 700, the only 700 on the site.

### Copy
Em dashes were doing two unrelated jobs with one mark. Split, 19 strings:
- **Separators** → middle dot, script-appropriate: `Est. 2025 · Tokyo, Japan`,
  `@パデル東京・11月8日`.
- **Prose** → comma, colon or full stop.

### Video
| | before | after |
|---|---|---|
| hero, desktop scrub | 6.12 MB, 24fps, CRF 25 | **4.58 MB**, 12fps, CRF 22 |
| hero, mobile scrub | 2.53 MB | 2.00 MB |
| scrub distance | 520svh (~3,100px) | 320svh (~2,200px) |

12fps is invisible because scroll ties frames to *distance*, not time — and
halving the frame count is what paid for the much lower CRF. The **loop tier
stays 24fps** because it is actually played, not seeked. `FPS` in
`ScrollVideoHero.tsx` must match the `fps=` filter in the encode script.

Past-events clip: remuxed `-c copy` (there is no master, so re-encoding could
only lose quality), stray iPhone data track and device metadata stripped, and
reframed from a letterboxed 16:9 slot into a true 9:16 frame.

### Images and caching
- 1.82 MB of JPEG/PNG → **474 KB** of AVIF at full size, with responsive
  `srcset`. Served through `src/components/Picture.tsx` (AVIF → WebP →
  original).
- Versioned media (`/media/v2`, `/img/v1`) is `immutable` for a year. Legacy
  unversioned JPEG/PNG fallbacks get 30 days + `stale-while-revalidate`.

### Layout
- Illustration captions (EQUIPMENT / THE COURT / GAMEPLAY) removed at the
  client's request — markup, CSS, and the now-unreferenced `mediaLabels`
  strings.
- Event floater card: was 3 lines with a two-character 「ティ」 orphan on `/ja`;
  now 280px at `--t-lead` with `text-wrap: balance`, two even lines in both
  locales.
- `scroll-margin-top` on headings, driven by a `--header-h` token.

### Motion
- Second easing token: `--ease-entrance` (expo-out) for entrances;
  `--ease` (Material in/out) stays on hovers and reversible state.
- Reveals 0.9s → 0.75s; cascade tightened.
- `will-change` scoped to `:not(.visible)`, so ~30 compositor layers get
  dropped after they land instead of living for the session.

Measured at 4× CPU throttle: no frames over 32ms before or after. This was a
*feel* problem, not a performance one. Worst frame during content reveals
16.7ms → 9.4ms.

---

## 3. Traps — every one of these cost a build to find

### 3.1 A generic family mid-stack silently kills the Japanese font

**Symptom:** `/ja` renders in Hiragino. The CSS says Shippori Mincho. The font
files download successfully. `document.fonts` shows no errors.

**Cause:** `next/font`'s `fallback` array is baked into the CSS variable. So
`fallback: ["Georgia", "serif"]` on the *Latin* font makes `--font-serif`
expand to `"Cormorant Garamond", Georgia, serif`. `--stack-display` is
`var(--font-serif), var(--font-jp-serif)` — which flattens to
`... Georgia, serif, "Shippori Mincho", ...`. **A generic family is terminal in
font matching**: the browser stops at `serif` and paints the platform serif.
Everything after it is dead.

**Rule:** no `fallback` on the Latin fonts. The generic belongs exactly once,
at the end of the JP variables.

**Detect:** `CSS.getPlatformFontsForNode` over CDP — `scripts/verify-type.mjs`
does this. Reading the stylesheet cannot catch it.

### 3.2 `word-break: auto-phrase` site-wide overflows narrow screens

Applied globally it *replaces* Japanese's normal break-between-any-two-characters
behaviour with breaks only at phrase boundaries. A line Chrome reads as one
phrase then has nowhere to break and runs straight out of its box — the 390px
hero subline did exactly this. It is scoped to the two hero display lines, with
`overflow-wrap: anywhere` as a guard. Don't promote it to `html:lang(ja)`.

### 3.3 `:lang(ja)` outranks a bare element selector

`:lang(ja)` matches **every** element on the page (lang inherits) at specificity
(0,1,0), which beats `h2` (0,0,1) and ties `.svh-title`. A blanket
`:lang(ja) { line-height: 1.85 }` therefore reassigns *body* leading to the
*display* headings. First version of the JP rules did this and the headings
came out visibly loose.

**Rule:** Japanese overrides go on `html:lang(ja)` as **token** redefinitions,
so each component rule stays in charge of its own role.

### 3.4 satori has no `inset` shorthand, and no gradient in `background`

The OG card's scrim did not paint at all, silently. Both overlays needed
explicit `top/left/width/height`, and gradients parse only from
`backgroundImage`, not the `background` shorthand.

### 3.5 satori renders a variable font at its default instance

Google ships Cormorant Garamond as variable-only. Asking satori for weight 400
gets you whatever the file's default is. `scripts/build-og-fonts.sh` pins
`wght=400` with `fontTools.varLib.instancer` before subsetting.

### 3.6 Next applies *every* matching header rule, last one wins

The broad `.jpg` rule was overriding the versioned-tree rule, so posters inside
`/media/v2` were getting the 30-day policy on the strength of their extension.
In `next.config.ts` the broad extension rule must come **first** and the
versioned-tree rule **second**.

### 3.7 `<picture>` must not become a layout box

`Picture.tsx` wraps every photo in `<picture>`, which is inline by default and
would become the flex item / direct child in place of the `<img>`.
`picture { display: contents; }` in `globals.css` keeps it out of the box tree
so every selector written against `img` still describes the thing being laid
out. Don't remove it.

### 3.8 Headless screenshots lie about fonts

`chrome --headless --screenshot` captures before webfonts finish, so Japanese
renders in the fallback and lines that fit look like they overflow. Always
`await document.fonts.ready` and capture over CDP. One "bug" I chased for a
build was purely this.

---

## 4. Scripts

All are run by hand, never in the build. Their output is committed.

| Script | Does | Re-run when |
|---|---|---|
| `scripts/encode-hero-video.sh` | Hero scrub + loop tiers + poster into `public/media/$VER` | hero footage changes |
| `scripts/encode-event-video.sh` | Remuxes the past-events clip, strips the data track | that clip changes |
| `scripts/optimize-images.mjs` | AVIF/WebP derivatives + `src/lib/image-manifest.json` | a photo is added or replaced |
| `scripts/build-og-fonts.sh` | Subsets the two OG-card fonts | `meta.ogEyebrow` / `meta.ogTagline` change |
| `scripts/gen-hero-video.sh` | Regenerates hero footage via fal.ai (pre-existing) | rarely |
| `scripts/verify-type.mjs` | CDP type audit | any type or font change |

**Two coupling rules that will bite silently:**

1. `FPS` in `ScrollVideoHero.tsx` must equal the `fps=` filter for the **scrub
   tiers** in `encode-hero-video.sh`. Currently 12.
2. `build-og-fonts.sh` subsets to an explicit character list. A character in
   the OG copy that isn't in that list renders as a blank box on the card.

**Bumping media:** write into a new versioned directory (`/media/v3`,
`/img/v2`), update the references, delete the old tree once nothing points at
it. The version is a path segment rather than a filename suffix so the cache
rule in `next.config.ts` is a plain prefix match.

---

## 5. Verifying

```bash
npm run build && npx next start -p 3111 &

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --remote-debugging-port=9222 \
  --user-data-dir=/tmp/verify-chrome about:blank &

node scripts/verify-type.mjs http://localhost:3111/ja 1440
node scripts/verify-type.mjs http://localhost:3111/en 375
```

Reports the resolved font file per role, every computed size, weights, italic
count, errored faces and horizontal overflow. Exits non-zero on: Japanese set
in italic, a weight outside 400/500, a failed font face, or horizontal
overflow.

Last run, all green at 375 / 768 / 1440 on both locales: **0 italics, weights
400 and 500 only, 0 errored faces, no overflow.**

Also worth checking by hand:

```bash
curl -sI localhost:3111/media/v2/scroll-hero-1280.mp4 | grep -i cache-control
#   → public, max-age=31536000, immutable
curl -s localhost:3111/ja | grep -o 'og:[^"]*'
```

`npx tsc --noEmit` is clean. `npm run lint` reports **3 warnings, 0 errors** —
all `no-img-element`, all deliberate: `Picture.tsx` is intentionally not
`next/image` (static art-directed photos on a fully prerendered page; the
optimiser would add a per-request hop and Vercel image units for no gain over
files encoded once and cached immutably), and the other two are the hero poster
and the OG card's satori `<img>`, neither of which can be `next/image`.

---

## 6. Not done, and why

| | Why |
|---|---|
| Hero at 1080p | **No master exists.** The source is `public/ai_video_test.mp4`, an AI-generated 1280×720 clip. The audit's 1920×1080 target is not reachable honestly. |
| Past-events re-cut | No master. Only the compressed 720×1280 web file survives, so it was remuxed rather than re-encoded. |
| `sketch*.png` → SVG | No vector originals in the repo. |
| Japanese font subsetting | Would take `/ja` fonts from ~525 KB to well under 100 KB, but introduces a silent failure mode: new Japanese copy containing a glyph outside the subset falls back to the OS font, which is the exact bug §3.1 was about. Only worth it with the subset generated from `content.ts` automatically. |

**Unreferenced files still in `public/`:** `friends/guys.png` (4.5 MB),
`friends/_S9A9207.JPG`, `friends/event.JPG`, `friends/girls-web.jpg`,
`logo.png`. They don't affect page weight but are ~9 MB of deploy. Left in
place — deleting them is the owner's call.

---

## 7. Open decisions for the client

1. **Desktop `/en` first visit is ~6.1 MB**, 4.6 MB of it the hero video.
   Mobile is far under (854 tier 2.0 MB, loop tier 627 KB). If the scroll-scrub
   isn't load-bearing for the brand, a plain 8-second 1080p loop is a quarter of
   the bytes and has none of these problems.
2. **Feature-card body copy sits at 38% opacity on dark green.** Legible at
   15px but the weakest contrast pairing on the page. Flagged, not changed.
3. **`public/dj.jpg` is a two-up collage** — a DJ on the left, empty courts on
   the right — displayed as a single image. Reads as a layout bug at a glance.
   Not touched; it's a content decision.
4. **Typefaces were signed off** by the client on this pass: keep Cormorant +
   DM Sans for Latin, keep Shippori Mincho + Zen Kaku Gothic New for Japanese.
   Four alternatives were rendered in the site's own copy and rejected. If it
   comes up again, the specimen sheet is at
   <https://claude.ai/code/artifact/e44b2ee3-3cc4-4025-80dc-c9363c9d3c6c>.

---

## 8. Audit items still open

From the original spec, everything is done except as noted in §6. Two audit
claims turned out not to reproduce and were **not** acted on:

- **"Unused Roboto 400 face"** — there is no Roboto anywhere in the source, and
  Tailwind is installed but has no `@import` in `globals.css`, so it isn't
  active either. Most likely a browser default observed on the live site.
- **"`document.fonts` reports fallback faces with status `error`"** — not
  reproducible. Current builds report zero errored faces at every width and
  locale. The metric fallbacks are working.
