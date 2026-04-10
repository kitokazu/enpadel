"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Option = { value: string; label: string };

export default function CustomSelect({
  name,
  options,
}: {
  name: string;
  options: Option[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [focused, setFocused] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setFocused(-1);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [close]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      close();
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setFocused(selected);
      } else if (focused >= 0) {
        setSelected(focused);
        close();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setFocused(selected);
      } else {
        setFocused((f) => Math.min(f + 1, options.length - 1));
      }
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocused((f) => Math.max(f - 1, 0));
    }
  }

  return (
    <div className="custom-select" ref={ref}>
      <input type="hidden" name={name} value={options[selected].value} />
      <button
        type="button"
        className="cs-trigger"
        onClick={() => { setOpen(!open); setFocused(open ? -1 : selected); }}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{options[selected].label}</span>
        <svg className={`cs-chevron${open ? " open" : ""}`} width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>
      {open && (
        <ul className="cs-dropdown" role="listbox">
          {options.map((opt, i) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={i === selected}
              className={`cs-option${i === selected ? " selected" : ""}${i === focused ? " focused" : ""}`}
              onClick={() => { setSelected(i); close(); }}
              onMouseEnter={() => setFocused(i)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
