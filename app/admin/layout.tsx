"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/brands", label: "Brands", icon: "🏷️" },
  { href: "/admin/news", label: "News", icon: "📰" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== "ADMIN") {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-sm text-muted">Checking access…</main>
    );
  }

  return (
    <main className="flex w-full flex-col gap-8 px-6 py-10 sm:px-8 lg:flex-row xl:px-12">
      <aside className="lg:w-56 lg:shrink-0">
        <div className="glass rounded-2xl p-4 lg:sticky lg:top-24">
          <div className="mb-4 px-2">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>

          <nav className="flex gap-1 lg:flex-col">
            {NAV.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors lg:flex-none ${
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

          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="mt-4 hidden w-full rounded-xl border border-border px-3 py-2.5 text-left text-sm text-muted transition-colors hover:text-foreground lg:block"
          >
            Log out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </main>
  );
}
