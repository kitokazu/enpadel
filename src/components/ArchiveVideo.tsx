"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The past-events clip. Plays by itself once it scrolls into view, and pauses
 * again when it leaves.
 *
 * Autoplay is safe here specifically because the file has no audio track at
 * all (it is remuxed video-only, see scripts/encode-event-video.sh), so muted
 * playback loses nothing and can never surprise anyone. `controls` stays, so a
 * visitor can take it over.
 *
 * Nothing is fetched until the clip is close: `src` and `poster` are both
 * withheld until the observer fires. That matters on a phone, where this is
 * 5.8MB, and it is also why the poster is not on the initial markup — a
 * `<video poster>` has no lazy attribute and fetches as eagerly as any image.
 *
 * Visitors who asked for reduced motion get the poster and the controls, and
 * decide for themselves.
 */
type State = { load: boolean; autoplay: boolean };

export default function ArchiveVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<State>({ load: false, autoplay: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState({ load: true, autoplay: !reduced });
          // On re-entry the src is already attached, so play here rather than
          // relying on the autoplay attribute, which only fires once.
          if (!reduced && el.currentSrc) el.play().catch(() => {});
        } else if (!el.paused) {
          el.pause();
        }
      },
      // Enough lead time to have decoded a frame before it is on screen.
      { rootMargin: "300px 0px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src={state.load ? src : undefined}
      poster={state.load ? poster : undefined}
      preload={state.load ? "auto" : "none"}
      autoPlay={state.autoplay}
      muted
      loop
      controls
      playsInline
      disablePictureInPicture
      // 720x1280 native. Declaring it keeps the box from resizing once
      // metadata lands, which is where the CLS would come from.
      width={720}
      height={1280}
    />
  );
}
