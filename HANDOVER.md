# Handover — site fix pass + design refresh, Aug–Sep 2026

Two branches, in order:

1. **`site-fixes-2026-08`** — the August audit pass. Merged as PR #1 (open).
2. **`design-refresh-2026-09`** — branched from it, implements the design
   handoff in `references/design_handoff_enpadel_refresh/`.

The design handoff was written against `main`, so it does not know about the
first branch. Where the two disagreed the client adjudicated: **the handoff
wins on type**. That reverses four things the August pass had decided — italic
serif leads, `.7rem` labels, the 300 display weight, and the `mediaLabels`
strings — all of which are back. Everything in the August pass that the handoff
does not touch (share cards, per-locale metadata, Japanese webfonts, the video
re-encode, caching) is unchanged.

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

### Italics are Latin-only, and there are three weights

- **The leads are serif italic** (`.concept-subline`, `.who-tagline`,
  `.ev-name`, `.padel-lead`, `.svh-sub`) — the redesign's call.
- **Never on Japanese.** No JP face carries an italic, so the browser
  synthesises one by skewing the glyphs, and it looks broken. A `:lang(ja)`
  block in `globals.css` cancels `font-style` on every element that takes an
  italic. The design handoff does not mention this, because it was written
  against a build that had the fault; `/en` shows 14 italics, `/ja` shows 0,
  and `scripts/verify-type.mjs` fails the build if that ever flips.
- **300, 400, 500.** 300 is display only (h2, the hero title). No 700.

### The scale

Four roles, replacing the nine small-caps sizes and six body sizes the audit
found:

```
--t-label (.7rem/.2em uppercase)   every label, badge, caption, button
--t-body  (1rem/1.9)               all body copy
--t-lead  (1.35rem/1.6)            serif italic under headings
--t-display clamp(3rem,6.5vw,5.6rem)  h2
--t-small (.85rem) / --t-tiny (.78rem)  footer, notes, copyright
```

Plus five `--t-hero-*` values used only by the scroll intro, whose five beats
descend on a scale of their own that `--t-display` cannot describe at both
ends.

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

### 3.7 Hidden reveal states hang off `@media (scripting: enabled)`

Every start state in `globals.css` (`clip-path: inset(100% …)`, `opacity: 0`,
`translateY(110%)`) lives inside one `@media (scripting: enabled)` block.
Without JavaScript the block never applies, so nothing is hidden and the page
renders complete — rather than being hidden by CSS and depending on a script to
reveal it.

**Do not go back to a script-set flag on `<html>`.** Two earlier versions of
this did, and both are hydration mismatches React reports and refuses to patch:

- `classList.add('js')` — React renders `<html>`'s `className` (the
  `next/font` variables live there), so adding to it before hydration desyncs
  the attribute React owns.
- `setAttribute('data-js','')` — no better. React compares the attributes
  actually on the node against the props it rendered, so an extra one is still
  a mismatch:

      <html lang="ja" className="cormorant_garamond_... dm_sans_...">
    - data-js=""

A media query touches no DOM, needs no script, and cannot desync from the
server render. Browsers without the `scripting` feature (pre-2023) skip the
block and show everything immediately, which is the safe direction to fail.
`suppressHydrationWarning` would also silence the warning, but by hiding every
attribute mismatch on that element rather than by not causing one.

One rule was missed when this was first written — `.ig-tile`'s closed clip —
and six Instagram tiles were invisible with scripts off. `scripts/`-adjacent
check: load with JavaScript disabled and confirm no element is left at
`opacity: 0` or a non-zero `inset()`.

Two related traps in the same area:

- **Every start rule must be one class less specific than its pinned
  counterpart** (`.ig-tile` vs `.ig-tile.is-in`, `.section-label::before` vs
  `.section-label.is-in::before`), because a media query adds no specificity.
  Pinning has to win on the selector alone.
- **Reveal effects must pin their final state on a timer** (`PIN_AFTER`), and
  `Reveal.tsx` keeps a scroll fallback beside the IntersectionObserver, because
  IO has been seen not to fire while the hero video is seeking.

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
| `scripts/build-og-fonts.sh` | Subsets the two OG-card fonts | `meta.ogEyebrow` / `meta.ogTagline` change |
| `scripts/gen-hero-video.sh` | Regenerates hero footage via fal.ai (pre-existing) | rarely |
| `scripts/verify-type.mjs` | CDP type audit | any type or font change |

Photos go through `next/image` now (`images.formats` in `next.config.ts`), so
there is no derivative-generation step and no `<Picture>` component; the
`/img/v1` tree the August pass generated has been removed.

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

Last run, green at 390 / 1280 on both locales: `/ja` **0 italics**, `/en` 14
(the redesign's Latin leads), weights 300/400/500, 0 errored faces, no
horizontal overflow.

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

## 6b. Design refresh — what landed, and the one target it misses

Implemented in full from `references/design_handoff_enpadel_refresh/README.md`:
the type scale and contrast tokens, all six section rebuilds (Concept, Padel's
serif lead + index row + hairline feature list, Who with the reel moved below
full-bleed, the Event definition list, the portrait Past video, the Instagram
band and tile grid), the motion spec in `Reveal.tsx` (`motion` + `animejs`,
loaded dynamically and only there), and every item in the handoff's
"Mobile (≤ 860px)" list.

**Verified:** no horizontal overflow at 390 / 430 / 768 / 1280 on both locales;
tap targets 44×44 or larger; Instagram grid lands on 2 columns at 390 and 3 at
768+, never 1; the Atmosphere card becomes a static caption below the photo on
mobile; the portrait video is ≤360px on phones; nothing is left hidden with
JavaScript off or under `prefers-reduced-motion`.

**Three deviations, all deliberate:**

1. **Japanese never takes an italic** (§1). The handoff does not mention it.
2. **The archive clip autoplays on scroll into view**, muted and looping, and
   pauses when it leaves. The handoff says "Do not autoplay"; the client asked
   for it afterwards, and the client's word wins. It is safe here because the
   file has no audio track at all, `controls` stays so a visitor can take over,
   nothing is fetched until the clip is near the viewport, and
   `prefers-reduced-motion` still gets a paused poster.
3. **The hero video is attached after `window.load`**, not during hydration.
   The prompt says to leave `ScrollVideoHero.tsx` alone apart from the track
   height, but the scrub tier is ~2MB with `preload="auto"`, and fetching it
   during hydration put it in direct competition with first paint. That change
   alone moved FCP 2.4s → 1.7s and LCP 5.6s → 4.4s.

**Lighthouse mobile: Performance 82–84, CLS 0.** CLS beats its target (< 0.05);
Performance misses ≥ 90. The cause is measured, not guessed:

- **LCP is the hero `<h1>`, at ~2.85s under a 1.6Mbps / 4× CPU throttle.** Not
  the poster. The handoff's own entrance timeline holds the title hidden for
  500ms and then animates it for 1100ms, so LCP cannot be under ~1.6s by
  construction, before any network cost.
- **~128KB of CSS is Japanese `@font-face` rules** — two stylesheets carrying
  244 and 242 of them, Google's unicode-range split for Shippori Mincho and Zen
  Kaku Gothic New. Lighthouse reports them 100% unused, correctly: they are
  declarations, not downloads.

Closing the gap means picking one:

- **Subset and self-host the two JP families** (see §6). 486 `@font-face` rules
  become 2, and ~128KB of CSS becomes a few hundred bytes. Biggest single win,
  and the reason it has not been done is in §6.
- **Shorten the hero entrance**, which is the LCP element and is specified by
  the handoff.

Both are the client's call, not an implementation detail.

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
