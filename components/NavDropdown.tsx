"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type NavChild = { href: string; label: string; emoji?: string };

/** A parent nav item that reveals its child links (e.g. "Categories" ->
 *  Phones/Laptops/Desktops/...) on hover or click, closing on outside click,
 *  Escape, or picking an item. */
export default function NavDropdown({ label, items }: { label: string; items: NavChild[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-1 transition-colors hover:text-foreground"
      >
        {label}
        <span className={`text-[9px] transition-transform duration-200 ${open ? "-scale-y-100" : ""}`}>▾</span>
      </button>

      <div
        role="menu"
        aria-label={label}
        style={{ backgroundColor: "var(--surface)" }}
        className={`absolute left-1/2 top-full z-50 mt-3 w-56 -translate-x-1/2 overflow-hidden rounded-2xl border border-border/60 py-1.5 shadow-xl transition-[transform,visibility,opacity] duration-150 ${
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0"
        }`}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/90 transition-colors hover:bg-(--overlay)"
          >
            {item.emoji && <span>{item.emoji}</span>}
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
