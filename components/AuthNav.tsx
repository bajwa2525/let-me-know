"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Drawer from "@/components/Drawer";
import Tooltip from "@/components/Tooltip";

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/brands", label: "Brands", icon: "🏷️" },
  { href: "/admin/news", label: "News", icon: "📰" },
];

export default function AuthNav() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // close the drawer automatically whenever navigation happens
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (loading) return null;

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-border px-4 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        Login
      </Link>
    );
  }

  const initial = user.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <>
      <Tooltip label={`${user.name} · account menu`}>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open account menu"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent transition-opacity hover:opacity-80"
        >
          {initial}
        </button>
      </Tooltip>

      <Drawer open={open} onClose={() => setOpen(false)}>
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 text-base font-semibold text-accent">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>
          <Tooltip label="Close menu" side="left">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-(--overlay) hover:text-foreground"
            >
              ✕
            </button>
          </Tooltip>
        </div>

        {user.role === "ADMIN" && (
          <>
            <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted">
              Admin
            </p>
            <nav className="mb-6 flex flex-col gap-1">
              {ADMIN_LINKS.map((item) => {
                const active =
                  item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-accent/15 text-foreground"
                        : "text-muted hover:bg-(--overlay) hover:text-foreground"
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </>
        )}

        <div className="mt-auto">
          <button
            onClick={logout}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-left text-sm text-muted transition-colors hover:text-foreground"
          >
            Log out
          </button>
        </div>
      </Drawer>
    </>
  );
}
