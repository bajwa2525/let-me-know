"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { CatalogItem } from "@/lib/categories";
import PriceBox from "@/components/PriceBox";

const INTERVAL_MS = 4500;

export default function HotModelsBanner({ products }: { products: CatalogItem[] }) {
  // Admin-flagged hot products (already sorted/limited by the caller); this
  // component just cycles through whatever it's given.
  const HOT = useMemo(() => products, [products]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || HOT.length === 0) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % HOT.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, HOT.length]);

  if (HOT.length === 0) return null;
  const phone = HOT[index];

  return (
    <section className="mx-auto max-w-6xl px-6 pb-16">
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="glass relative overflow-hidden rounded-3xl"
      >
        {/* animated gradient backdrop */}
        <div
          key={`bg-${phone.slug}`}
          className={`absolute inset-0 animate-[hotpan_8s_ease-in-out_infinite] bg-gradient-to-br ${phone.gradient} opacity-30`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_10%_0%,rgba(0,0,0,0)_0%,var(--surface)_100%)]" />

        <Link
          href={`${phone.basePath}/${phone.slug}`}
          key={`card-${phone.slug}`}
          className="relative flex flex-col items-center gap-6 p-6 sm:flex-row sm:p-10"
        >
          <div className="flex items-center gap-2 self-start rounded-full bg-black/30 px-3 py-1 text-[11px] font-medium text-white sm:hidden">
            🔥 Hot right now
          </div>

          <div
            key={`img-${phone.slug}`}
            className="relative h-40 w-full shrink-0 animate-[hotfade_600ms_ease-out] sm:h-48 sm:w-48"
          >
            <Image
              src={phone.image}
              alt={phone.imageAlt}
              fill
              sizes="200px"
              className="object-contain drop-shadow-2xl"
            />
          </div>

          <div key={`text-${phone.slug}`} className="flex-1 animate-[hotfade_600ms_ease-out]">
            <div className="mb-2 hidden items-center gap-2 rounded-full bg-(--overlay-strong) px-3 py-1 text-[11px] font-medium sm:inline-flex">
              🔥 Hot right now
            </div>
            <p className="text-sm text-muted">{phone.brand} • ★ {phone.rating.toFixed(1)}</p>
            <h2 className="mb-1 text-2xl font-bold sm:text-3xl">{phone.name}</h2>
            <p className="mb-4 max-w-md text-sm text-muted">{phone.tagline}</p>
            <PriceBox price={phone.price} size="md" />
          </div>
        </Link>

        {/* dots */}
        <div className="relative mb-4 flex justify-center gap-1.5 sm:absolute sm:bottom-4 sm:right-6 sm:mb-0">
          {HOT.map((p, i) => (
            <button
              key={`${p.basePath}-${p.slug}`}
              type="button"
              aria-label={`Show ${p.name}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-accent" : "w-1.5 bg-(--overlay-stronger) hover:bg-(--overlay-strongest)"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
