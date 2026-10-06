"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CatalogItem } from "@/lib/categories";

export default function SearchBox({ products }: { products: CatalogItem[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const q = query.trim().toLowerCase();
  const allProducts = products;
  const results =
    q.length === 0
      ? []
      : allProducts
          .filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.brand.toLowerCase().includes(q) ||
              p.tags.some((t) => t.toLowerCase().includes(q))
          )
          .slice(0, 6);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xs">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        type="search"
        placeholder="Search phones, laptops, brands..."
        aria-label="Search phones and laptops"
        className="glass w-full rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
      />

      {open && q.length > 0 && (
        <div className="glass absolute top-full z-50 mt-2 w-full overflow-hidden rounded-2xl">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">No results match &ldquo;{query}&rdquo;</p>
          ) : (
            results.map((p) => (
              <Link
                key={`${p.basePath}-${p.slug}`}
                href={`${p.basePath}/${p.slug}`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-(--overlay)"
              >
                <span>
                  <span className="font-medium">{p.name}</span>{" "}
                  <span className="text-muted">· {p.brand}</span>
                </span>
                <span className="text-xs text-muted">{p.price}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
