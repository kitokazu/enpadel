"use client";

import { useEffect } from "react";

/**
 * Every scroll-driven effect on the page, wired from data attributes.
 *
 * Replaces RevealObserver's one-size blur-slide. The markup declares intent
 * (`data-wipe="left"`, `data-stagger`, `data-count`) and this decides how to
 * animate it, so page.tsx stays free of motion code and a section can change
 * its reveal by editing one attribute.
 *
 * Three rules shape the whole file:
 *
 * 1. **Nothing may be left hidden.** The initial states live in CSS, so a
 *    failure to animate is a failure to *show*. Every effect therefore pins
 *    its final state (`.is-in`) ~1.2s after firing, and there is a scroll
 *    fallback in case IntersectionObserver never fires — which was observed
 *    while the hero video is seeking on some browsers.
 * 2. **Only transform, opacity and clip-path.** Never filter or box-shadow;
 *    those repaint every frame.
 * 3. **The libraries are loaded here and nowhere else**, dynamically, so they
 *    stay out of the server bundle and off the critical path.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
/** Fires when the element's top passes 88% of the viewport. */
const IN_VIEW_MARGIN = "0px 0px -12% 0px";
/** However an effect starts, its final state is guaranteed by this deadline. */
const PIN_AFTER = 1200;

type Cleanup = () => void;

export default function Reveal() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Tilt and magnetic pull follow a cursor. On touch they do nothing useful
    // and cost a listener per element.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const wide = window.matchMedia("(min-width: 861px)").matches;

    const all = <T extends Element>(sel: string) =>
      Array.from(document.querySelectorAll<T>(sel));

    const pin = (el: Element) => el.classList.add("is-in");

    // Reduced motion: show every final state and wire nothing.
    if (reduced) {
      all("[data-label],[data-heading],[data-stagger],[data-wipe],[data-pop],.ig-tile").forEach(pin);
      all<HTMLElement>("[data-count]").forEach((el) => {
        el.textContent = String(el.dataset.count ?? el.textContent ?? "").padStart(2, "0");
      });
      return;
    }

    const cleanups: Cleanup[] = [];
    let cancelled = false;

    (async () => {
      const [{ animate, inView, scroll, stagger }, anime] = await Promise.all([
        import("motion"),
        import("animejs"),
      ]);
      if (cancelled) return;

      /** Run `fn` once when `el` reaches the trigger line, then guarantee the end state. */
      const onEnter = (el: Element, fn: () => void) => {
        let fired = false;
        const run = () => {
          if (fired) return;
          fired = true;
          fn();
          window.setTimeout(() => pin(el), PIN_AFTER);
        };
        const stop = inView(el, () => { run(); return undefined; }, { margin: IN_VIEW_MARGIN });
        cleanups.push(stop);
        // Fallback: if IO never fires (it has been seen to stall while the
        // hero video seeks), a scroll check still gets the element shown.
        const check = () => {
          if (fired) return;
          if (el.getBoundingClientRect().top < window.innerHeight * 0.88) run();
        };
        window.addEventListener("scroll", check, { passive: true });
        cleanups.push(() => window.removeEventListener("scroll", check));
        check();
      };

      /* ── Section label: the gold rule draws itself, then the text ──
         The rule is a ::before, which JS cannot target, so its scaleX is a
         CSS transition keyed off .is-in. Only the text is animated here. */
      all("[data-label]").forEach((el) => {
        const text = el.querySelector("span");
        onEnter(el, () => {
          pin(el);
          if (text) {
            animate(text, { opacity: [0, 1], x: [-6, 0] }, { duration: 0.8, delay: 0.25, ease: EASE });
          }
        });
      });

      /* ── Headings: each line rises out of its own mask ── */
      all("[data-heading]").forEach((el) => {
        const lines = Array.from(el.querySelectorAll<HTMLElement>(".line-mask > span"));
        onEnter(el, () => {
          if (!lines.length) return;
          animate(lines, { y: ["110%", "0%"] }, { duration: 1, delay: stagger(0.11), ease: EASE });
        });
      });

      /* ── Body groups ── */
      all("[data-stagger]").forEach((el) => {
        const kids = Array.from(el.children) as HTMLElement[];
        onEnter(el, () => {
          animate(kids, { opacity: [0, 1], y: [18, 0] }, {
            duration: 0.9, delay: stagger(0.09, { startDelay: 0.15 }), ease: EASE,
          });
        });
      });

      /* ── Images: the frame wipes open, the picture settles back ── */
      all<HTMLElement>("[data-wipe]").forEach((el) => {
        const dir = el.dataset.wipe || "right";
        const from =
          dir === "left" ? "inset(0 100% 0 0)" :
          dir === "bottom" ? "inset(100% 0 0 0)" :
          "inset(0 0 0 100%)";
        const inner = el.querySelector<HTMLElement>("img, video, picture > img");
        onEnter(el, () => {
          animate(el, { clipPath: [from, "inset(0 0 0 0)"] }, { duration: 1.2, ease: EASE });
          if (inner) animate(inner, { scale: [1.12, 1] }, { duration: 1.6, ease: EASE });
        });
      });

      /* ── Simple pop, for anything that just needs to arrive ── */
      all("[data-pop]").forEach((el) => {
        onEnter(el, () => {
          animate(el, { opacity: [0, 1], y: [18, 0] }, { duration: 0.9, ease: EASE });
        });
      });

      /* ── Instagram tiles: wipe up, left to right ── */
      const tiles = all<HTMLElement>(".ig-tile");
      if (tiles.length) {
        const grid = tiles[0].parentElement!;
        onEnter(grid, () => {
          tiles.forEach((tile, i) => {
            window.setTimeout(() => {
              animate(tile, { clipPath: ["inset(100% 0 0 0)", "inset(0 0 0 0)"] }, { duration: 0.9, ease: EASE });
              const img = tile.querySelector("img");
              if (img) animate(img, { scale: [1.15, 1] }, { duration: 1.3, ease: EASE });
              window.setTimeout(() => pin(tile), PIN_AFTER);
            }, i * 70);
          });
        });
      }

      /* ── Feature numbers count up ── */
      all<HTMLElement>("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count || 0);
        const pad = (el.dataset.count || "").length;
        onEnter(el, () => {
          const obj = { v: 0 };
          anime.animate(obj, {
            v: target,
            duration: 900,
            ease: "outExpo",
            onUpdate: () => { el.textContent = String(Math.round(obj.v)).padStart(pad, "0"); },
            onComplete: () => { el.textContent = String(target).padStart(pad, "0"); },
          });
        });
      });

      /* ── Parallax: desktop only, and only while the section is on screen ── */
      if (wide) {
        all<HTMLElement>("[data-parallax]").forEach((el) => {
          const range = Number(el.dataset.parallax || 30);
          const stop = scroll(
            (progress: number) => {
              el.style.setProperty("--py", `${(progress - 0.5) * 2 * range}px`);
            },
            { target: el.closest("section") ?? el, offset: ["start end", "end start"] }
          );
          cleanups.push(stop as Cleanup);
        });
      }

      /* ── Sketch tiles tilt toward the cursor ── */
      if (fine) {
        all<HTMLElement>("[data-tilt]").forEach((el) => {
          const img = el.querySelector<HTMLElement>("img");
          const move = (e: MouseEvent) => {
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            animate(el, { rotateY: px * 16, rotateX: -py * 16 }, { duration: 0.4, ease: EASE });
            if (img) animate(img, { x: -px * 12, y: -py * 12 }, { duration: 0.4, ease: EASE });
          };
          const leave = () => {
            animate(el, { rotateX: 0, rotateY: 0 }, { type: "spring", stiffness: 180, damping: 14 });
            if (img) animate(img, { x: 0, y: 0 }, { type: "spring", stiffness: 180, damping: 14 });
          };
          el.addEventListener("mousemove", move);
          el.addEventListener("mouseleave", leave);
          cleanups.push(() => {
            el.removeEventListener("mousemove", move);
            el.removeEventListener("mouseleave", leave);
          });
        });

        /* ── Magnetic buttons ── */
        all<HTMLElement>("[data-magnet]").forEach((el) => {
          const move = (e: MouseEvent) => {
            const r = el.getBoundingClientRect();
            animate(el, {
              x: (e.clientX - (r.left + r.width / 2)) * 0.25,
              y: (e.clientY - (r.top + r.height / 2)) * 0.35,
            }, { duration: 0.3, ease: EASE });
          };
          const leave = () => {
            animate(el, { x: 0, y: 0 }, { type: "spring", stiffness: 260, damping: 12 });
          };
          el.addEventListener("mousemove", move);
          el.addEventListener("mouseleave", leave);
          cleanups.push(() => {
            el.removeEventListener("mousemove", move);
            el.removeEventListener("mouseleave", leave);
          });
        });
      }

      /* ── Nav entrance ── */
      const navItems = all("[data-nav-item]");
      if (navItems.length) {
        anime.animate(navItems, {
          opacity: [0, 1],
          y: [-8, 0],
          duration: 800,
          delay: anime.stagger(70, { start: 200 }),
          ease: "outQuint",
        });
      }
    })();

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => { try { fn(); } catch { /* already torn down */ } });
    };
  }, []);

  return null;
}
