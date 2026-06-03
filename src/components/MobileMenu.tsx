"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/content";
import { content, t } from "@/lib/content";
import InstagramIcon from "./InstagramIcon";

export default function MobileMenu({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const navTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const c = content;

  // Lock body scroll and drop the nav's backdrop-filter while the menu is
  // open. A scrolled nav has `backdrop-filter`, which makes it the containing
  // block for the fixed overlay — that clips the full-screen menu to the nav
  // bar. We restore it only after the close animation so the overlay doesn't
  // re-clip mid fade-out.
  const setNav = useCallback((isOpen: boolean) => {
    const nav = document.getElementById("nav");
    document.body.style.overflow = isOpen ? "hidden" : "";
    if (navTimer.current) {
      clearTimeout(navTimer.current);
      navTimer.current = null;
    }
    if (isOpen) {
      nav?.classList.add("menu-open");
    } else {
      navTimer.current = setTimeout(() => nav?.classList.remove("menu-open"), 450);
    }
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setNav(false);
  }, [setNav]);

  function toggle() {
    const next = !open;
    setOpen(next);
    setNav(next);
  }

  useEffect(() => {
    return () => {
      if (navTimer.current) clearTimeout(navTimer.current);
      document.body.style.overflow = "";
      document.getElementById("nav")?.classList.remove("menu-open");
    };
  }, []);

  return (
    <>
      <button
        className={`mobile-burger${open ? " open" : ""}`}
        onClick={toggle}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        <span className="burger-line" />
        <span className="burger-line" />
        <span className="burger-line" />
      </button>

      <div className={`mobile-overlay${open ? " open" : ""}`} onClick={close}>
        <nav className="mobile-nav" onClick={(e) => e.stopPropagation()}>
          <ul>
            <li className="mn-item d1">
              <a href="#padel" onClick={close}>{t(c.nav.links.padel, locale)}</a>
            </li>
            <li className="mn-item d2">
              <a href="#who" onClick={close}>{t(c.nav.links.who, locale)}</a>
            </li>
            <li className="mn-item d3">
              <a href="#event" onClick={close}>{t(c.nav.links.events, locale)}</a>
            </li>
            <li className="mn-item d4">
              <a href="#contact" onClick={close}>{t(c.nav.links.contact, locale)}</a>
            </li>
          </ul>
          <div className="mn-footer">
            <div className="lang-toggle">
              <Link href="/ja" className={`lang-btn${locale === "ja" ? " active" : ""}`} onClick={close}>JP</Link>
              <span className="lang-sep">|</span>
              <Link href="/en" className={`lang-btn${locale === "en" ? " active" : ""}`} onClick={close}>EN</Link>
            </div>
            <a href="https://instagram.com/enpadel" className="mn-ig" target="_blank" rel="noopener">
              <InstagramIcon size={18} />
              <span>@enpadel</span>
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
