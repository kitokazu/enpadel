"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * Where a beat sits and how big it is. Placement follows the footage: the
 * camera subject moves right-to-centre through the ten seconds, so the type
 * moves to the opposite side rather than printing over someone's face. Scale
 * descends across the sequence, from statement to invitation.
 */
export type HeroVariant =
  | "center-lg"    // brand title card, open court behind it
  | "center-hero"  // the 縁 symbol, largest thing in the piece
  | "left-lg"      // subjects on the right of frame
  | "left-md"      // explanatory copy, reads as a caption
  | "left-low";    // the CTA, low and small, hands off to the page

export type HeroPanel = {
  variant: HeroVariant;
  eyebrow?: string;
  /** May contain <br/> — sourced from our own content.ts, never user input. */
  titleHtml: string;
  sub?: string;
  cta?: { label: string; href: string };
};

/**
 * Which video the visitor gets. The two scrub tiers are encoded with every
 * frame as a keyframe, so each seek decodes exactly one frame. The loop tier is
 * a normal GOP encode that is never seeked.
 */
type Tier = "scrub-hi" | "scrub-lo" | "loop";

const SRC: Record<Tier, string> = {
  "scrub-hi": "/media/v2/scroll-hero-1280.mp4",
  "scrub-lo": "/media/v2/scroll-hero-854.mp4",
  loop: "/media/v2/scroll-hero-loop.mp4",
};

const POSTER = "/media/v2/scroll-hero-poster.jpg";

/**
 * Frame rate of the two SCRUB tiers only — the loop tier stays at 24fps
 * because it is actually played. Scroll ties frames to distance rather than to
 * time, so half the frames are invisible here, and dropping them is what paid
 * for the much lower CRF: same bytes, better picture. Must match the `fps=`
 * filter in scripts/encode-hero-video.sh.
 */
const FPS = 12;
/**
 * Panels do not crossfade through each other: a beat fades out completely,
 * a sliver of pure footage plays, then the next fades in. Two legible headings
 * on screen at once reads as a rendering bug rather than a dissolve, and it is
 * worst in Japanese where both blocks are dense. Units are scroll progress.
 */
const GAP = 0.015;
const RAMP = 0.045;
/** Expand the track anyway if the video never reports itself ready. */
const READY_TIMEOUT = 8000;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function pickTier(): Tier {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const conn = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  const slowLink = /(^|-)(2g|slow-2g)$/.test(conn?.effectiveType ?? "");
  const cores = navigator.hardwareConcurrency ?? 4;
  // Phones scrub too — the 854p all-keyframe encode is 2.5MB and one seek per
  // frame is cheap. The loop tier is only for visitors who asked for less
  // motion or less data, or hardware that can't decode a seek per frame.
  if (reduce || conn?.saveData || slowLink || cores < 4) return "loop";
  return window.innerWidth > 1100 ? "scrub-hi" : "scrub-lo";
}

export default function ScrollVideoHero({
  panels,
  scrollLabel,
}: {
  panels: HeroPanel[];
  scrollLabel: string;
}) {
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tier, setTier] = useState<Tier | null>(null);
  const [ready, setReady] = useState(false);
  const [painted, setPainted] = useState(false);

  // One motion value, written by one rAF loop. The panels derive from it, so
  // text and footage can never drift apart.
  const progress = useMotionValue(0);

  // Tier detection is client-only. The server renders no video and no tier, so
  // the first client render matches it exactly and there is nothing to mismatch.
  useEffect(() => {
    const apply = () => setTier(pickTier());
    apply();
    const queries = [
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(max-width: 1100px)"),
    ];
    queries.forEach((q) => q.addEventListener("change", apply));
    return () => queries.forEach((q) => q.removeEventListener("change", apply));
  }, []);

  const isLoop = tier === "loop";

  // Prime the video and open the track. Two Safari behaviours shape this:
  // the desktop one will not composite a <video> that has never entered a
  // playing state, and the iOS one will not even FETCH a muted inline video
  // on its own — preload="auto" is ignored and loadeddata may simply never
  // fire. So don't wait for loadeddata: kick playback immediately (pausing on
  // the first frame), and expand the track on loadedmetadata. Opening early
  // is safe because the scrub loop never seeks past what has buffered — the
  // worst an early scroller sees is the poster while bytes arrive.
  useEffect(() => {
    if (!tier) return;
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;

    const markReady = () => !cancelled && setReady(true);

    if (video.readyState >= 1) markReady();
    else video.addEventListener("loadedmetadata", markReady, { once: true });

    if (!isLoop) {
      const played = video.play();
      if (played)
        played
          .then(() => {
            if (cancelled) return;
            video.pause();
            setReady(true);
          })
          .catch(() => {
            // Autoplay refused (iOS Low Power Mode). Data still loads and
            // paused seeks still paint, so fall back to a plain load.
            if (!cancelled) video.load();
          });
    }

    // Backstop: if the file never even reports metadata, still open the
    // track rather than stranding the visitor on panel one.
    const timer = window.setTimeout(markReady, READY_TIMEOUT);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      video.removeEventListener("loadedmetadata", markReady);
    };
  }, [tier, isLoop]);

  // The driver. Geometry is cached, so the loop only reads window.scrollY and
  // writes — no forced reflow per frame.
  useEffect(() => {
    const track = containerRef.current;
    if (!track || !tier || isLoop) return;
    const video = videoRef.current;

    let top = 0;
    let travel = 1;
    let lastWidth = window.innerWidth;
    const measure = () => {
      top = track.getBoundingClientRect().top + window.scrollY;
      travel = Math.max(1, track.offsetHeight - window.innerHeight);
    };
    measure();

    let raf = 0;
    let last = performance.now();
    // Honour scroll restoration: start where the page actually is, not at 0.
    let current = clamp01((window.scrollY - top) / travel);
    let lastFrame = -1;
    progress.set(current);

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(64, now - last);
      last = now;

      const target = clamp01((window.scrollY - top) / travel);
      // Exponential decay rather than a spring: monotonic, so the footage never
      // runs backwards at the end of a flick the way an overshoot would.
      // Large jumps (anchor links, `scroll-behavior: smooth`) snap instead of
      // crawling through hundreds of frames.
      if (Math.abs(target - current) > 0.25) current = target;
      else current += (target - current) * (1 - Math.pow(0.001, dt / 1000));
      progress.set(current);

      if (!video || video.readyState < 2) return;
      const duration = video.duration;
      if (!duration || Number.isNaN(duration)) return;

      // Quantize to the frame grid so we can never issue more than one seek per
      // real frame of footage.
      const lastIndex = Math.max(0, Math.round(duration * FPS) - 1);
      let frame = Math.min(lastIndex, Math.round(current * lastIndex));

      // Never seek past what has actually downloaded; lag is recoverable, a
      // frozen frame is not. Storing the clamped index means we retry as more
      // bytes arrive.
      const buffered = video.buffered;
      if (buffered.length) {
        const maxFrame = Math.floor((buffered.end(buffered.length - 1) - 1 / FPS) * FPS);
        if (frame > maxFrame) frame = Math.max(0, maxFrame);
      }

      if (frame !== lastFrame && !video.seeking) {
        lastFrame = frame;
        // Aim at the middle of the frame so the demuxer cannot round down.
        video.currentTime = (frame + 0.5) / FPS;
      }
    };

    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // Only run while the intro is actually on screen, and never in a hidden tab.
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), {
      threshold: 0,
    });
    io.observe(track);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    // Ignore height-only resizes: on iOS the URL bar collapsing fires resize
    // constantly and must not re-trigger the layout math mid-scroll.
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      measure();
    };
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(measure);
    ro.observe(track);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [tier, isLoop, ready, progress]);

  return (
    <section
      ref={containerRef}
      id="home"
      className={`svh${isLoop ? " svh--loop" : ""}`}
      data-ready={ready ? "1" : "0"}
    >
      <div className="svh-sticky">
        <img
          src={POSTER}
          alt=""
          aria-hidden="true"
          className={`svh-poster${painted ? " is-hidden" : ""}`}
        />

        {tier && (
          <video
            ref={videoRef}
            className={`svh-video${painted ? " is-ready" : ""}`}
            src={SRC[tier]}
            poster={POSTER}
            preload={isLoop ? "metadata" : "auto"}
            muted
            playsInline
            autoPlay={isLoop}
            loop={isLoop}
            disablePictureInPicture
            disableRemotePlayback
            aria-hidden="true"
            tabIndex={-1}
            onSeeked={() => setPainted(true)}
            onPlaying={() => setPainted(true)}
          />
        )}

        {/* Base shading: top band clears the nav, bottom carries the hand-off,
            plus the vignette. Always on. */}
        <div className="svh-scrim" aria-hidden="true" />
        {/* The pool of shade under the type travels with it — centred for the
            first two beats, left-weighted once the type moves to the side. */}
        {isLoop ? (
          <div className="svh-pool svh-pool--center" aria-hidden="true" />
        ) : (
          <TravellingPool progress={progress} />
        )}
        <div className="svh-grain" aria-hidden="true" />

        {/* In scrub mode the panels are pinned with the video and crossfade in
            place. In loop mode they live outside the sticky box and scroll past
            it, so they must not be clipped by its overflow. */}
        {!isLoop && (
          <>
            <div className="svh-stage">
              {panels.map((panel, i) => (
                <ScrubPanel
                  key={i}
                  panel={panel}
                  index={i}
                  total={panels.length}
                  progress={progress}
                />
              ))}
            </div>
            <ScrollCue label={scrollLabel} progress={progress} />
            <ProgressRail progress={progress} />
          </>
        )}
      </div>

      {isLoop && (
        <div className="svh-stage">
          {panels.map((panel, i) => (
            <StaticPanel key={i} panel={panel} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ── Scroll-driven panel ───────────────────────────────────────────── */

function ScrubPanel({
  panel,
  index,
  total,
  progress,
}: {
  panel: HeroPanel;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  // The first panel is already fully visible at rest at the top of the page,
  // and the last one stays up until the section hands off to the page below.
  const inA = isFirst ? 0 : start + GAP;
  const inB = isFirst ? 0.0001 : start + GAP + RAMP;
  const outA = isLast ? 1 : end - GAP - RAMP;
  const outB = isLast ? 1.0001 : end - GAP;

  const opacity = useTransform(
    progress,
    [inA, inB, outA, outB],
    [isFirst ? 1 : 0, 1, 1, isLast ? 1 : 0]
  );

  const y = useTransform(
    progress,
    [inA, outB],
    [isFirst ? 0 : 30, -30]
  );

  return (
    <motion.div
      className={`svh-panel${isFirst ? " svh-panel--first" : ""}`}
      data-v={panel.variant}
      style={{ opacity, y }}
    >
      <PanelBody panel={panel} isFirst={isFirst} />
    </motion.div>
  );
}

/**
 * Crossfades the centred pool of shade into a left-weighted one in the gap
 * between beat two and beat three, where the type moves to the side.
 */
function TravellingPool({ progress }: { progress: MotionValue<number> }) {
  const centerOpacity = useTransform(progress, [0.385, 0.415], [1, 0]);
  const leftOpacity = useTransform(progress, [0.385, 0.415], [0, 1]);
  return (
    <>
      <motion.div
        className="svh-pool svh-pool--center"
        style={{ opacity: centerOpacity }}
        aria-hidden="true"
      />
      <motion.div
        className="svh-pool svh-pool--left"
        style={{ opacity: leftOpacity }}
        aria-hidden="true"
      />
    </>
  );
}

/* ── Fallback panel: plain in-view fade, no scrubbing ──────────────── */

function StaticPanel({ panel, index }: { panel: HeroPanel; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // Plain DOM writes from a scroll listener, deliberately not framer-driven.
  // Two reasons, both learned the hard way:
  // - framer's useScroll({target}) caches element offsets, and in this layout
  //   (a sticky sibling plus the stage's -100svh pull-up) the cached offset
  //   landed a full viewport low — beats faded in while their box was already
  //   exiting, printing text over the fixed nav.
  // - Routing the fix through a MotionValue keeps framer's scheduler between
  //   the measurement and the pixels. getBoundingClientRect at event time is
  //   ground truth; writing style in the same tick keeps it that way.
  // Progress semantics match framer's ["start end", "end start"]: 0 when the
  // panel's top touches the viewport bottom, 1 when its bottom clears the top.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const noTranslate = !!reduced;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp01((vh - rect.top) / (vh + rect.height));
      // The windows are set so a beat is fully OUT (0.68) before the next is
      // visible at all (0.2): with 92svh panels the next beat's progress
      // trails this one's by ~0.48, so 0.68 - 0.48 = 0.2 — they meet exactly,
      // and two half-faded beats can never share a phone screen. The
      // out-window must also start above 0.5: the first panel sits at ~0.5
      // when the page loads at rest, and must not already be fading. The
      // sliver of pure footage between beats matches the desktop scrub GAP.
      const o =
        p < 0.2 ? 0 :
        p < 0.4 ? (p - 0.2) / 0.2 :
        p <= 0.56 ? 1 :
        p < 0.68 ? 1 - (p - 0.56) / 0.12 : 0;
      el.style.opacity = o.toFixed(3);
      if (!noTranslate) {
        const t = clamp01((p - 0.2) / 0.48);
        el.style.transform = `translateY(${(24 - 48 * t).toFixed(1)}px)`;
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [reduced]);

  return (
    <div
      ref={ref}
      /* No variant on narrow screens: "left" versus "centre" is meaningless at
         390px, so the fallback keeps every beat centred. */
      className={`svh-panel svh-panel--static${index === 0 ? " svh-panel--first" : ""}`}
      style={{ opacity: 0 }}
    >
      <PanelBody panel={panel} isFirst={index === 0} />
    </div>
  );
}

function PanelBody({ panel, isFirst }: { panel: HeroPanel; isFirst: boolean }) {
  // The opening beat carries the page's only h1.
  const Heading = isFirst ? "h1" : "h2";
  return (
    <div className="svh-panel-inner">
      {panel.eyebrow && <p className="svh-eyebrow">{panel.eyebrow}</p>}
      <Heading
        className="svh-title"
        dangerouslySetInnerHTML={{ __html: panel.titleHtml }}
      />
      {panel.sub && <p className="svh-sub">{panel.sub}</p>}
      {panel.cta && (
        <a className="svh-cta" href={panel.cta.href}>
          <span>{panel.cta.label}</span>
          <span className="svh-cta-arrow" aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

/* ── Chrome ────────────────────────────────────────────────────────── */

function ScrollCue({
  label,
  progress,
}: {
  label: string;
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, [0, 0.045], [1, 0]);
  return (
    <motion.div className="svh-cue" style={{ opacity }} aria-hidden="true">
      <span className="svh-cue-line" />
      <span>{label}</span>
    </motion.div>
  );
}

function ProgressRail({ progress }: { progress: MotionValue<number> }) {
  const scaleY = useTransform(progress, [0, 1], [0, 1]);
  return (
    <div className="svh-rail" aria-hidden="true">
      <motion.span className="svh-rail-fill" style={{ scaleY }} />
    </div>
  );
}
