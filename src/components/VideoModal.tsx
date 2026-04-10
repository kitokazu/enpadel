"use client";

import { useEffect, useCallback, useState } from "react";

export default function VideoModal({ closeLabel }: { closeLabel: string }) {
  const [open, setOpen] = useState(false);
  const VIDEO_URL = "";

  const openVid = useCallback(() => {
    if (!VIDEO_URL) return;
    setOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeVid = useCallback(() => {
    setOpen(false);
    document.body.style.overflow = "";
  }, []);

  useEffect(() => {
    const ph = document.getElementById("pastPlaceholder");
    if (!ph) return;
    const handleClick = () => openVid();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") openVid();
    };
    ph.addEventListener("click", handleClick);
    ph.addEventListener("keydown", handleKey as EventListener);
    return () => {
      ph.removeEventListener("click", handleClick);
      ph.removeEventListener("keydown", handleKey as EventListener);
    };
  }, [openVid]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeVid();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeVid]);

  return (
    <div
      className={`v-modal${open ? " open" : ""}`}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeVid();
      }}
    >
      <div className="v-modal-inner">
        <button className="v-modal-close" onClick={closeVid}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 2l12 12M14 2L2 14" />
          </svg>
          <span>{closeLabel}</span>
        </button>
        <div className="v-modal-ratio">
          {open && VIDEO_URL && (
            <iframe
              src={VIDEO_URL}
              title="EnPadel Launch Session"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </div>
    </div>
  );
}
