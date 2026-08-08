"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A muted background loop that costs nothing until it is scrolled near, and
 * pauses again once it leaves. Without this the browser starts fetching the
 * file on page load even though it sits far below the fold.
 */
export default function LazyVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // play() here would race the React render that attaches src — on
          // first intersection there is nothing to play yet, which left the
          // video frozen on its poster for anyone who scrolled straight to it
          // and stopped. The autoPlay attribute starts it once src arrives;
          // this play() only handles re-entry after a pause().
          setMounted(true);
          if (video.currentSrc) video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      src={mounted ? src : undefined}
      preload="none"
      autoPlay
      muted
      loop
      playsInline
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
