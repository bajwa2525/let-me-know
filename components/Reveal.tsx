"use client";

import { useEffect, useRef, useState } from "react";

/** Fades + slides a section in the first time it scrolls into view — a
 *  lightweight, dependency-free scroll-reveal used across grids and lists so
 *  the page feels alive while scrolling instead of popping in all at once. */
export default function Reveal({
  children,
  delayMs = 0,
  className,
}: {
  children: React.ReactNode;
  /** Stagger delay in ms — pass `index * 60` in a `.map()` for a cascade. */
  delayMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Reduced-motion users start already "visible" (no pop-in wait); this only
  // reads matchMedia during the initial client render, never sets state
  // inside the effect body itself.
  const [visible, setVisible] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (visible) return; // already shown (reduced motion) — nothing to observe
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className ?? ""}`}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
