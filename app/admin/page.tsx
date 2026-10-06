"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type Brand, type Product, type ProductStats, type ProductType } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Reveal from "@/components/Reveal";

const TYPE_META: Record<ProductType, { label: string; emoji: string }> = {
  PHONE: { label: "Phones", emoji: "📱" },
  LAPTOP: { label: "Laptops", emoji: "💻" },
  DESKTOP: { label: "Desktops", emoji: "🖥️" },
  GAMING: { label: "Gaming", emoji: "🎮" },
  ACCESSORY: { label: "Accessories", emoji: "🎧" },
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [recent, setRecent] = useState<Product[] | null>(null);
  const [brands, setBrands] = useState<Brand[] | null>(null);
  const [newsTotal, setNewsTotal] = useState<number | null>(null);

  useEffect(() => {
    api.getStats().then(setStats);
    api.listProducts({ pageSize: 5, page: 1 }).then((res) => setRecent(res.data));
    api.listAllBrands().then(setBrands);
    api.listNews({ pageSize: 1 }).then((res) => setNewsTotal(res.total));
  }, []);

  const total = stats?.total ?? 0;
  const byType = (Object.keys(TYPE_META) as ProductType[]).map((type) => ({
    type,
    ...TYPE_META[type],
    count: stats?.byType[type] ?? 0,
  }));

  return (
    <div>
      <Reveal>
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="mb-8 text-sm text-muted">Here&apos;s what&apos;s happening in your catalog.</p>
      </Reveal>

      <Reveal delayMs={60}>
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="glass col-span-2 flex flex-col justify-between rounded-2xl p-5 sm:col-span-1 lg:col-span-2">
            <span className="text-sm text-muted">Total products</span>
            <span className="text-gradient text-4xl font-semibold">
              {stats === null ? "…" : total}
            </span>
          </div>
          {byType.map((t) => (
            <div key={t.type} className="glass flex flex-col justify-between rounded-2xl p-5">
              <span className="text-lg">{t.emoji}</span>
              <div>
                <span className="block text-2xl font-semibold">
                  {stats === null ? "…" : t.count}
                </span>
                <span className="text-xs text-muted">{t.label}</span>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delayMs={100}>
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link href="/admin/brands" className="glass flex flex-col gap-1 rounded-2xl p-5 transition-opacity hover:opacity-80">
            <span className="text-lg">🏷️</span>
            <span className="text-2xl font-semibold">{brands === null ? "…" : brands.length}</span>
            <span className="text-xs text-muted">Brands</span>
          </Link>
          <Link href="/admin/news" className="glass flex flex-col gap-1 rounded-2xl p-5 transition-opacity hover:opacity-80">
            <span className="text-lg">📰</span>
            <span className="text-2xl font-semibold">{newsTotal === null ? "…" : newsTotal}</span>
            <span className="text-xs text-muted">News articles</span>
          </Link>
          <Link href="/admin/products" className="glass flex flex-col gap-1 rounded-2xl p-5 transition-opacity hover:opacity-80">
            <span className="text-lg">🔥</span>
            <span className="text-2xl font-semibold">{stats === null ? "…" : stats.hot}</span>
            <span className="text-xs text-muted">Hot products</span>
          </Link>
          <Link href="/admin/products" className="glass flex flex-col gap-1 rounded-2xl p-5 transition-opacity hover:opacity-80">
            <span className="text-lg">⭐</span>
            <span className="text-2xl font-semibold">{stats === null ? "…" : stats.featured}</span>
            <span className="text-xs text-muted">Top products</span>
          </Link>
        </div>
      </Reveal>

      <Reveal delayMs={140}>
        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/admin/products"
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            + Add product
          </Link>
          <Link
            href="/admin/brands"
            className="rounded-lg border border-border px-5 py-2.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            Manage brands
          </Link>
          <Link
            href="/admin/news"
            className="rounded-lg border border-border px-5 py-2.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            Write news
          </Link>
        </div>
      </Reveal>

      <Reveal delayMs={180}>
        <h2 className="mb-4 text-lg font-medium">Recently added</h2>
        <div className="flex flex-col gap-2">
          {recent === null && <p className="text-sm text-muted">Loading…</p>}
          {recent !== null && recent.length === 0 && (
            <p className="text-sm text-muted">
              No products yet —{" "}
              <Link href="/admin/products" className="text-accent hover:underline">
                add your first one
              </Link>
              .
            </p>
          )}
          {(recent ?? []).map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {p.brand.name} {p.name}
                </p>
                <p className="text-xs text-muted">
                  {TYPE_META[p.productType].emoji} {TYPE_META[p.productType].label} · added{" "}
                  {new Date(p.dateAdded).toLocaleDateString()}
                </p>
              </div>
              <Link
                href="/admin/products"
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:text-foreground"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
