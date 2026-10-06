"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Drawer from "@/components/Drawer";

type NavLink = { href: string; label: string; emoji?: string };

export default function MobileNav({
  categoryLinks,
  navEnd,
}: {
  categoryLinks: NavLink[];
  navEnd: NavLink[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(() =>
    categoryLinks.some((c) => pathname.startsWith(c.href))
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-foreground md:hidden"
      >
        <span className="sr-only">Menu</span>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path
            d="M2.25 4.5h13.5M2.25 9h13.5M2.25 13.5h13.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <Drawer open={open} onClose={() => setOpen(false)}>
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight">Menu</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-(--overlay) hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          <Link
            href="/"
            className={`rounded-xl px-3 py-2.5 text-sm transition-colors ${
              pathname === "/" ? "bg-accent/15 text-foreground" : "text-muted hover:bg-(--overlay) hover:text-foreground"
            }`}
          >
            Home
          </Link>

          <button
            type="button"
            onClick={() => setCategoriesOpen((v) => !v)}
            aria-expanded={categoriesOpen}
            className="mt-2 flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-(--overlay) hover:text-foreground"
          >
            Categories
            <span
              className={`text-[10px] transition-transform duration-200 ${categoriesOpen ? "rotate-180" : ""}`}
            >
              ▾
            </span>
          </button>
          <div
            className={`grid overflow-hidden transition-[grid-template-rows] duration-200 ${
              categoriesOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="flex min-h-0 flex-col gap-1">
              {categoryLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl py-2.5 pl-6 pr-3 text-sm transition-colors ${
                    pathname === item.href
                      ? "bg-accent/15 text-foreground"
                      : "text-muted hover:bg-(--overlay) hover:text-foreground"
                  }`}
                >
                  {item.emoji && <span>{item.emoji}</span>}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="my-2 border-t border-border" />

          {navEnd.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-xl px-3 py-2.5 text-sm transition-colors ${
                pathname === item.href
                  ? "bg-accent/15 text-foreground"
                  : "text-muted hover:bg-(--overlay) hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Drawer>
    </>
  );
}
