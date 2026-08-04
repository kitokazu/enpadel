"use client";

import { useEffect } from "react";

const SECTION_IDS = ["padel", "who", "event", "contact"];

export default function NavScroll() {
  useEffect(() => {
    const nav = document.getElementById("nav");
    if (!nav) return;
    // The scroll-video intro is dark and full-bleed, so the nav has to stay
    // transparent for its whole length. Going cream at 55px would paint a
    // blurred bar over the footage for five screens.
    const hero = document.getElementById("home");
    const handler = () => {
      const threshold = hero ? hero.offsetHeight - 80 : 55;
      nav.classList.toggle("scrolled", window.scrollY > threshold);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);

    // Active section indicator
    const links = nav.querySelectorAll<HTMLAnchorElement>(".nav-center a");
    const linkMap = new Map<string, HTMLAnchorElement>();
    links.forEach((a) => {
      const hash = a.getAttribute("href");
      if (hash) linkMap.set(hash.replace("#", ""), a);
    });

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = linkMap.get(entry.target.id);
          if (link) {
            link.classList.toggle("nav-active", entry.isIntersecting);
          }
        });
      },
      { threshold: 0, rootMargin: "-40% 0px -55% 0px" }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
      sectionObserver.disconnect();
    };
  }, []);

  return null;
}
