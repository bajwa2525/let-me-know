"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import type { CatalogItem } from "@/lib/categories";
import PriceBox from "@/components/PriceBox";
import Tooltip from "@/components/Tooltip";

const SWIPE_THRESHOLD = 55;
const DETAIL_TABS = ["Overview", "Specs", "Highlights", "Verdict"] as const;
const AUTOSCROLL_STEP_PX = 0.5;
const AUTOSCROLL_INTERVAL_MS = 30;
const AUTOSCROLL_RESUME_DELAY_MS = 2500;

const TABS = [{ slug: "all", label: "All", emoji: "🏷️" }, ...CATEGORIES];

export default function ProductReel({ products: allProducts }: { products: CatalogItem[] }) {
  const [categorySlug, setCategorySlug] = useState("all");
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  const start = useRef<{ x: number; y: number } | null>(null);
  const axis = useRef<"x" | "y" | null>(null);

  // Top-rated products first, scoped to the selected category tab.
  const products = useMemo(() => {
    const scoped =
      categorySlug === "all" ? allProducts : allProducts.filter((p) => p.category === categorySlug);
    return [...scoped].sort((a, b) => b.rating - a.rating);
  }, [categorySlug, allProducts]);

  const selectCategory = useCallback((slug: string) => {
    setCategorySlug(slug);
    setIndex(0);
  }, []);

  const product = products[index];

  // Left/right = next/prev product in this category. Up/down = next/prev category.
  const goProduct = useCallback((dir: 1 | -1) => {
    setIndex((i) => Math.min(products.length - 1, Math.max(0, i + dir)));
  }, [products.length]);

  const goCategory = useCallback((dir: 1 | -1) => {
    setCategorySlug((slug) => {
      const i = TABS.findIndex((t) => t.slug === slug);
      const next = TABS[Math.min(TABS.length - 1, Math.max(0, i + dir))];
      return next.slug;
    });
    setIndex(0);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY };
    axis.current = null;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;

    if (!axis.current) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }

    if (axis.current === "x") {
      setDragX(dx);
      setDragY(0);
    } else {
      setDragY(dy);
      setDragX(0);
    }
  };

  const endDrag = () => {
    if (axis.current === "x") {
      if (dragX <= -SWIPE_THRESHOLD) goProduct(1);
      else if (dragX >= SWIPE_THRESHOLD) goProduct(-1);
    } else if (axis.current === "y") {
      if (dragY <= -SWIPE_THRESHOLD) goCategory(1);
      else if (dragY >= SWIPE_THRESHOLD) goCategory(-1);
    }
    start.current = null;
    axis.current = null;
    setDragging(false);
    setDragX(0);
    setDragY(0);
  };

  // At the first/last category, a further wheel-down/up is left alone (no
  // preventDefault) so it falls through to the page's normal scroll — the
  // escape hatch for mouse/trackpad users, matching the on-screen button
  // below for touch users.
  const categoryIndex = TABS.findIndex((t) => t.slug === categorySlug);
  const wheelLock = useRef(false);
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < 20) return;
    const atEnd = e.deltaY > 0 && categoryIndex === TABS.length - 1;
    const atStart = e.deltaY < 0 && categoryIndex === 0;
    if (atEnd || atStart) return;
    e.preventDefault();
    if (wheelLock.current) return;
    wheelLock.current = true;
    if (e.deltaY > 0) goCategory(1);
    else goCategory(-1);
    setTimeout(() => (wheelLock.current = false), 450);
  };

  const scrollPastReel = () => {
    window.scrollTo({ top: window.scrollY + window.innerHeight, behavior: "smooth" });
  };

  const cardStyle = useMemo(
    () => ({
      transform: `translate3d(${dragX}px, ${dragY}px, 0) rotate(${dragX / 40}deg)`,
      transition: dragging ? "none" : "transform 300ms cubic-bezier(.2,.8,.2,1)",
    }),
    [dragX, dragY, dragging]
  );

  // Auto-scroll the info panel top to bottom, on loop, while the reader
  // isn't actively engaged with it (hovering to read, or mid-scroll/touch).
  const contentRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const resumeAt = useRef(0);
  const [activeSection, setActiveSection] = useState(0);

  const holdAutoscroll = useCallback(() => {
    resumeAt.current = Infinity;
  }, []);
  const releaseAutoscroll = useCallback(() => {
    resumeAt.current = Date.now() + AUTOSCROLL_RESUME_DELAY_MS;
  }, []);

  useEffect(() => {
    resumeAt.current = Date.now() + AUTOSCROLL_RESUME_DELAY_MS;
    contentRef.current?.scrollTo({ top: 0 });
    setActiveSection(0);
  }, [product?.slug]);

  const syncActiveSection = useCallback((scrollTop: number) => {
    const sections = Object.entries(sectionRefs.current);
    let current = 0;
    for (const [i, node] of sections) {
      if (node && node.offsetTop <= scrollTop + 24) current = Number(i);
    }
    setActiveSection((prev) => (prev === current ? prev : current));
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const id = setInterval(() => {
      if (Date.now() < resumeAt.current) return;
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll <= 0) return;
      if (el.scrollTop >= maxScroll - 1) {
        resumeAt.current = Date.now() + AUTOSCROLL_RESUME_DELAY_MS;
        el.scrollTo({ top: 0 });
        return;
      }
      el.scrollTop += AUTOSCROLL_STEP_PX;
      syncActiveSection(el.scrollTop);
    }, AUTOSCROLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [product, syncActiveSection]);

  // Keep the jump-dots in sync with the reader's own manual scrolling too,
  // not just the auto-scroll loop — free scroll after a pause is the point.
  const onContentScroll = () => {
    if (contentRef.current) syncActiveSection(contentRef.current.scrollTop);
  };

  const jumpToSection = (i: number) => {
    holdAutoscroll();
    sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(i);
    releaseAutoscroll();
  };

  if (!product) return null;

  return (
    <section className="relative flex h-dvh w-full flex-col overflow-hidden select-none">
      {/* Category tabs — pick which category's top products the reel shows.
          Compact row so the stage below still fills the rest of this one view. */}
      <div className="flex shrink-0 flex-wrap justify-center gap-2 px-6 pb-3 pt-3">
        {TABS.map((t) => (
          <button
            key={t.slug}
            type="button"
            onClick={() => selectCategory(t.slug)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              categorySlug === t.slug
                ? "border-transparent bg-white text-slate-900"
                : "border-white/10 bg-white/5 text-muted hover:text-foreground"
            }`}
          >
            <span>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Escape hatch: the stage below captures swipe/wheel for product &
          category gestures, so this is the guaranteed way to keep scrolling
          the page past the reel on touch devices (desktop can also wheel
          past it once at the last category). */}
      <button
        type="button"
        onClick={scrollPastReel}
        aria-label="Scroll past the reel"
        className="glass absolute inset-x-0 bottom-[calc(34%+0.75rem)] z-30 mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm shadow-lg hover:bg-(--overlay-strong) sm:bottom-[calc(30%+0.75rem)]"
      >
        ↓
      </button>

      {/* Full-view stage — fills the rest of this screen. Edge-to-edge on
          mobile, cinematic vertical frame on desktop. Photo fills it fully. */}
      <div className="relative min-h-0 flex-1 sm:flex sm:items-center sm:justify-center sm:p-4">
        <div
          className="relative h-full w-full touch-none overflow-hidden sm:mx-auto sm:h-full sm:max-w-sm sm:rounded-3xl lg:max-w-md"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={() => dragging && endDrag()}
          onWheel={onWheel}
        >
          <div className="absolute inset-0 overflow-hidden sm:rounded-3xl" style={cardStyle}>
            {/* full-bleed device photo */}
            <div className={`absolute inset-0 bg-linear-to-br ${product.gradient}`}>
              <Image
                src={product.image}
                alt={product.imageAlt}
                fill
                sizes="(max-width: 640px) 100vw, 420px"
                className="object-cover"
                priority={index === 0}
              />
            </div>
            {/* legibility gradients — top for chrome, bottom for the glass panel */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-black/50 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-linear-to-t from-black/85 via-black/35 to-transparent" />

            <span className="absolute right-4 top-4 z-10 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
              {product.releaseYear}
            </span>
            <span className="pointer-events-none absolute left-4 top-4 z-10 text-[10px] font-medium text-white/80">
              {index + 1} / {products.length} · ↔ product · ↕ category
            </span>

            {/* Desktop D-pad — left/right jump products, up/down jump category.
                Mobile/touch users already have swipe. */}
            <div className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 grid-cols-3 grid-rows-3 gap-1 lg:grid">
              <Tooltip label="Previous category" side="top">
                <button
                  type="button"
                  aria-label="Previous category"
                  disabled={categorySlug === TABS[0].slug}
                  onClick={() => goCategory(-1)}
                  className="glass col-start-2 row-start-1 flex h-8 w-8 items-center justify-center rounded-full text-sm shadow-lg disabled:cursor-not-allowed disabled:opacity-30 hover:bg-(--overlay-strong)"
                >
                  ↑
                </button>
              </Tooltip>
              <Tooltip label="Previous product" side="left">
                <button
                  type="button"
                  aria-label="Previous product"
                  disabled={index === 0}
                  onClick={() => goProduct(-1)}
                  className="glass col-start-1 row-start-2 flex h-8 w-8 items-center justify-center rounded-full text-sm shadow-lg disabled:cursor-not-allowed disabled:opacity-30 hover:bg-(--overlay-strong)"
                >
                  ←
                </button>
              </Tooltip>
              <Tooltip label="Next product" side="right">
                <button
                  type="button"
                  aria-label="Next product"
                  disabled={index === products.length - 1}
                  onClick={() => goProduct(1)}
                  className="glass col-start-3 row-start-2 flex h-8 w-8 items-center justify-center rounded-full text-sm shadow-lg disabled:cursor-not-allowed disabled:opacity-30 hover:bg-(--overlay-strong)"
                >
                  →
                </button>
              </Tooltip>
              <Tooltip label="Next category" side="bottom">
                <button
                  type="button"
                  aria-label="Next category"
                  disabled={categorySlug === TABS[TABS.length - 1].slug}
                  onClick={() => goCategory(1)}
                  className="glass col-start-2 row-start-3 flex h-8 w-8 items-center justify-center rounded-full text-sm shadow-lg disabled:cursor-not-allowed disabled:opacity-30 hover:bg-(--overlay-strong)"
                >
                  ↓
                </button>
              </Tooltip>
            </div>

            {/* glassy info panel — auto-scrolls until hovered or scrolled by hand.
                Fixed, deliberately short: a peek strip, not a takeover. */}
            <div
              className="absolute inset-x-0 bottom-0 z-10 flex h-[34%] min-h-52.5 flex-col rounded-t-3xl border-t border-white/15 bg-black/55 px-5 pb-4 pt-3 text-white backdrop-blur-xl sm:h-[30%]"
              onPointerDown={(e) => {
                e.stopPropagation();
                holdAutoscroll();
              }}
              onPointerUp={releaseAutoscroll}
              onMouseEnter={holdAutoscroll}
              onMouseLeave={releaseAutoscroll}
              onTouchStart={holdAutoscroll}
              onTouchEnd={releaseAutoscroll}
              onWheel={(e) => e.stopPropagation()}
            >
              <div className="mb-1 flex items-center gap-2 text-xs text-white/70">
                <span>{product.brand}</span>
                <span>•</span>
                <span>★ {product.rating.toFixed(1)}</span>
              </div>
              <h3 className="text-lg font-semibold leading-tight">{product.name}</h3>
              <p className="mb-2 line-clamp-1 text-xs text-white/75">{product.tagline}</p>

              {/* section jump dots, track scroll position */}
              <div className="mb-2 flex shrink-0 gap-1.5">
                {DETAIL_TABS.map((t, i) => (
                  <button
                    key={t}
                    type="button"
                    aria-label={`Jump to ${t}`}
                    onClick={() => jumpToSection(i)}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i === activeSection ? "bg-white" : "bg-white/25"
                    }`}
                  />
                ))}
              </div>

              <div
                ref={contentRef}
                onScroll={onContentScroll}
                onWheel={(e) => e.stopPropagation()}
                style={{
                  maskImage: "linear-gradient(to bottom, black calc(100% - 20px), transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, black calc(100% - 20px), transparent 100%)",
                }}
                className="min-h-0 flex-1 touch-auto space-y-4 overflow-y-auto pr-1 text-sm no-scrollbar"
              >
                <div ref={(el) => { sectionRefs.current[0] = el; }} className="space-y-2">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-white/50">Overview</p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((tg) => (
                      <span
                        key={tg}
                        className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/90"
                      >
                        {tg}
                      </span>
                    ))}
                  </div>
                  <p className="text-white/75">{product.quickSpecs[0]?.value}</p>
                  <PriceBox price={product.price} size="md" />
                </div>

                <div ref={(el) => { sectionRefs.current[1] = el; }} className="space-y-2">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-white/50">Specs</p>
                  <div className="grid grid-cols-2 gap-2">
                    {product.quickSpecs.map(({ icon, label, value }) => (
                      <div key={label} className="rounded-xl bg-white/10 p-2.5">
                        <p className="mb-0.5 text-[10px] text-white/60">
                          {icon} {label}
                        </p>
                        <p className="text-xs font-medium leading-tight">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div ref={(el) => { sectionRefs.current[2] = el; }} className="space-y-2">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-white/50">Highlights</p>
                  <div className="grid grid-cols-1 gap-2">
                    {product.highlightSpecs.map(({ icon, label, value }) => (
                      <div key={label} className="rounded-xl bg-white/10 p-3">
                        <p className="mb-1 text-[10px] text-white/60">
                          {icon} {label}
                        </p>
                        <p className="text-sm font-medium leading-snug">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div ref={(el) => { sectionRefs.current[3] = el; }} className="space-y-2 pb-1">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-white/50">Verdict</p>
                  <p className="text-white/90">{product.verdict}</p>
                  <div>
                    <p className="mb-1 text-emerald-300">Pros</p>
                    <ul className="list-inside list-disc text-white/70">
                      {product.pros.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1 text-rose-300">Cons</p>
                    <ul className="list-inside list-disc text-white/70">
                      {product.cons.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href={`${product.basePath}/${product.slug}`}
                    className="inline-block pt-1 text-xs font-medium text-white underline underline-offset-4"
                  >
                    Full details →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
