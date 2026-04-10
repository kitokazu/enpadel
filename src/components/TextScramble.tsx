"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = "!<>-_\\/[]{}=+*^?#~";

export default function TextScramble({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(text);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Respect reduced motion preference
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setDisplay(text);
      return;
    }

    const length = text.length;
    const duration = 1200;
    const start = performance.now();

    function update(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);

      let result = "";
      for (let i = 0; i < length; i++) {
        const charProgress = (progress * length - i) / 1;
        if (charProgress >= 1) {
          result += text[i];
        } else if (charProgress > 0) {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      setDisplay(result);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(update);
      } else {
        setDisplay(text);
      }
    }

    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [text]);

  return <span className={className}>{display}</span>;
}
