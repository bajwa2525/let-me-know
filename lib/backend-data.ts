// Server-side data-access layer for the public catalog. Fetches from the
// Express + Postgres backend (see /backend) and maps each result into the
// exact same shapes the existing page components were already built around
// (Phone, Laptop, Desktop, GamingDevice, Accessory, CatalogItem,
// CatalogBrand, NewsArticle, MarketRate) — so only the data-loading call
// sites change, not the JSX that renders them.

import type { Phone, PhoneSpec } from "@/lib/phones";
import { slugifyBrand } from "@/lib/phones";
import type { Laptop, LaptopSpec } from "@/lib/laptops";
import type { Desktop, DesktopSpec } from "@/lib/desktops";
import type { GamingDevice, GamingSpec } from "@/lib/gaming";
import type { Accessory, AccessorySpec } from "@/lib/accessories";
import type { NewsArticle } from "@/lib/news";
import type { MarketRate, PricePoint } from "@/lib/market";
import { formatPkr } from "@/lib/market";
import type { CatalogItem, CatalogBrand, SpecEntry } from "@/lib/categories";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type BackendProductType = "PHONE" | "LAPTOP" | "DESKTOP" | "GAMING" | "ACCESSORY";

type BackendBrand = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  gradient?: string | null;
  colorway: string[];
  productCount?: number;
};

type BackendProduct = {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  productType: BackendProductType;
  brand: BackendBrand;
  priceUsd: number;
  releaseYear?: number | null;
  rating: number;
  tags: string[];
  gradient?: string | null;
  colorway: string[];
  image?: string | null;
  imageAlt?: string | null;
  verdict?: string | null;
  pros: string[];
  cons: string[];
  specs?: Record<string, string> | null;
  isHot: boolean;
  isFeatured: boolean;
  dateAdded: string;
  dateUpdated: string;
  gallery: { src: string; alt?: string | null; sortOrder: number }[];
  marketPrices: { market: string; city: string; price: number; stock: number }[];
  priceHistory: { avgPrice: number; recordedAt: string }[];
};

type BackendNews = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  image?: string | null;
  imageAlt?: string | null;
  category: string;
  author: string;
  date: string;
};

const TYPE_TO_CATEGORY: Record<BackendProductType, string> = {
  PHONE: "phones",
  LAPTOP: "laptops",
  DESKTOP: "desktops",
  GAMING: "gaming",
  ACCESSORY: "accessories",
};

async function backendFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Backend request failed: ${path} -> ${res.status}`);
  return res.json();
}

function formatUsd(value: number): string {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: value % 1 === 0 ? 0 : 2 })}`;
}

function gallery(p: BackendProduct) {
  return [...p.gallery]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((g) => ({ src: g.src, alt: g.alt || p.imageAlt || p.name }));
}

function toMarketRates(p: BackendProduct): MarketRate[] {
  const lowest = p.marketPrices.length ? Math.min(...p.marketPrices.map((m) => m.price)) : 0;
  return [...p.marketPrices]
    .sort((a, b) => a.price - b.price)
    .map((m) => ({
      market: m.market,
      city: m.city,
      price: m.price,
      priceLabel: formatPkr(m.price),
      isBest: m.price === lowest,
    }));
}

/** Real recorded price points (see PriceSnapshot in the backend) — a
 *  snapshot is taken whenever an admin sets/updates market prices, so this
 *  grows into a genuine trend over time instead of a simulation. */
function toPriceHistory(p: BackendProduct): PricePoint[] {
  return p.priceHistory.map((h) => ({
    label: new Date(h.recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: h.avgPrice,
  }));
}

async function fetchAllProductsRaw(): Promise<BackendProduct[]> {
  const res = await backendFetch<{ data: BackendProduct[] }>("/api/products?pageSize=100");
  return res.data;
}

async function fetchProductsByTypeRaw(type: BackendProductType): Promise<BackendProduct[]> {
  const res = await backendFetch<{ data: BackendProduct[] }>(
    `/api/products?type=${type}&pageSize=100`
  );
  return res.data;
}

// --- Per-category mappers, matching each lib/<category>.ts type exactly
// (plus a `marketRates` field every detail page needs for MarketPriceBoard).

type WithMarketRates<T> = T & { marketRates: MarketRate[]; priceHistory: PricePoint[] };

function toBase(p: BackendProduct) {
  return {
    slug: p.slug,
    brand: p.brand.name,
    name: p.name,
    tagline: p.tagline ?? "",
    price: formatUsd(p.priceUsd),
    releaseYear: p.releaseYear ?? 0,
    rating: p.rating,
    tags: p.tags,
    gradient: p.gradient ?? "from-slate-500 via-slate-300 to-amber-200",
    colorway: p.colorway,
    image: p.image ?? "",
    imageAlt: p.imageAlt ?? p.name,
    gallery: gallery(p),
    verdict: p.verdict ?? "",
    pros: p.pros,
    cons: p.cons,
    marketRates: toMarketRates(p),
    priceHistory: toPriceHistory(p),
  };
}

function toPhone(p: BackendProduct): WithMarketRates<Phone> {
  return { ...toBase(p), specs: (p.specs ?? {}) as unknown as PhoneSpec };
}
function toLaptop(p: BackendProduct): WithMarketRates<Laptop> {
  return { ...toBase(p), specs: (p.specs ?? {}) as unknown as LaptopSpec };
}
function toDesktop(p: BackendProduct): WithMarketRates<Desktop> {
  return { ...toBase(p), specs: (p.specs ?? {}) as unknown as DesktopSpec };
}
function toGamingDevice(p: BackendProduct): WithMarketRates<GamingDevice> {
  return { ...toBase(p), specs: (p.specs ?? {}) as unknown as GamingSpec };
}
function toAccessory(p: BackendProduct): WithMarketRates<Accessory> {
  return { ...toBase(p), specs: (p.specs ?? {}) as unknown as AccessorySpec };
}

export async function getPhones(): Promise<WithMarketRates<Phone>[]> {
  return (await fetchProductsByTypeRaw("PHONE")).map(toPhone);
}
export async function getLaptops(): Promise<WithMarketRates<Laptop>[]> {
  return (await fetchProductsByTypeRaw("LAPTOP")).map(toLaptop);
}
export async function getDesktops(): Promise<WithMarketRates<Desktop>[]> {
  return (await fetchProductsByTypeRaw("DESKTOP")).map(toDesktop);
}
export async function getGamingDevices(): Promise<WithMarketRates<GamingDevice>[]> {
  return (await fetchProductsByTypeRaw("GAMING")).map(toGamingDevice);
}
export async function getAccessories(): Promise<WithMarketRates<Accessory>[]> {
  return (await fetchProductsByTypeRaw("ACCESSORY")).map(toAccessory);
}

/** Brand list scoped to one category, with a per-category product count —
 *  the shape app/<category>/page.tsx's brand filter chips need. */
export function brandsFromItems(items: { brand: string; rating: number }[]) {
  const map = new Map<string, { name: string; slug: string; count: number; topRating: number }>();
  for (const item of items) {
    const existing = map.get(item.brand);
    if (existing) {
      existing.count += 1;
      existing.topRating = Math.max(existing.topRating, item.rating);
    } else {
      map.set(item.brand, {
        name: item.brand,
        slug: slugifyBrand(item.brand),
        count: 1,
        topRating: item.rating,
      });
    }
  }
  return Array.from(map.values());
}

// --- Aggregated catalog (every category combined) ---

function quickHighlightSpecs(category: string, specs: Record<string, string>): {
  quickSpecs: SpecEntry[];
  highlightSpecs: SpecEntry[];
} {
  switch (category) {
    case "phones":
      return {
        quickSpecs: [
          { icon: "⚙️", label: "Chipset", value: specs.chipset },
          { icon: "🧠", label: "RAM", value: specs.ram },
          { icon: "💾", label: "Storage", value: specs.storage },
          { icon: "⚖️", label: "Weight", value: specs.weight },
          { icon: "🤖", label: "OS", value: specs.os },
        ],
        highlightSpecs: [
          { icon: "📷", label: "Camera", value: specs.camera },
          { icon: "🔋", label: "Battery", value: specs.battery },
        ],
      };
    case "laptops":
      return {
        quickSpecs: [
          { icon: "⚙️", label: "CPU", value: specs.cpu },
          { icon: "🧠", label: "RAM", value: specs.ram },
          { icon: "💾", label: "Storage", value: specs.storage },
          { icon: "⚖️", label: "Weight", value: specs.weight },
          { icon: "💻", label: "OS", value: specs.os },
        ],
        highlightSpecs: [
          { icon: "🖥️", label: "Display", value: specs.display },
          { icon: "🔋", label: "Battery", value: specs.battery },
        ],
      };
    case "desktops":
      return {
        quickSpecs: [
          { icon: "🖥️", label: "Form factor", value: specs.formFactor },
          { icon: "⚙️", label: "CPU", value: specs.cpu },
          { icon: "🧠", label: "RAM", value: specs.ram },
          { icon: "💾", label: "Storage", value: specs.storage },
        ],
        highlightSpecs: [
          { icon: "🎮", label: "GPU", value: specs.gpu },
          { icon: "💻", label: "OS", value: specs.os },
        ],
      };
    default: // gaming, accessories
      return {
        quickSpecs: [
          { icon: "🏷️", label: "Type", value: specs.type },
          { icon: "🔗", label: "Compatibility", value: specs.compatibility },
          { icon: "🔌", label: "Connector", value: specs.connector },
          { icon: "⚖️", label: "Weight", value: specs.weight },
        ],
        highlightSpecs: [
          { icon: "💾", label: "Capacity", value: specs.capacity },
          { icon: "🔋", label: "Battery", value: specs.battery },
        ],
      };
  }
}

export type CatalogItemWithMeta = CatalogItem & {
  marketRates: MarketRate[];
  priceHistory: PricePoint[];
  isHot: boolean;
  isFeatured: boolean;
  dateUpdated: string;
};

function toCatalogItem(p: BackendProduct): CatalogItemWithMeta {
  const category = TYPE_TO_CATEGORY[p.productType];
  const specs = (p.specs ?? {}) as Record<string, string>;
  return {
    slug: p.slug,
    brand: p.brand.name,
    name: p.name,
    tagline: p.tagline ?? "",
    price: formatUsd(p.priceUsd),
    releaseYear: p.releaseYear ?? 0,
    rating: p.rating,
    tags: p.tags,
    gradient: p.gradient ?? "from-slate-500 via-slate-300 to-amber-200",
    colorway: p.colorway,
    image: p.image ?? "",
    imageAlt: p.imageAlt ?? p.name,
    gallery: gallery(p),
    verdict: p.verdict ?? "",
    pros: p.pros,
    cons: p.cons,
    category,
    basePath: `/${category}`,
    ...quickHighlightSpecs(category, specs),
    marketRates: toMarketRates(p),
    priceHistory: toPriceHistory(p),
    isHot: p.isHot,
    isFeatured: p.isFeatured,
    dateUpdated: p.dateUpdated,
  };
}

/** Every product across every category — home page, brands, reviews, markets. */
export async function getAllProductsAsync(): Promise<CatalogItemWithMeta[]> {
  return (await fetchAllProductsRaw()).map(toCatalogItem);
}

/** Admin-flagged "hot" products (Products admin → 🔥 Mark as hot), most
 *  recently flagged first — so once more products are flagged than fit the
 *  banner, the newest flag pushes the oldest one out automatically instead
 *  of an older-but-higher-rated product silently winning forever. Falls
 *  back to top-rated when nothing has been flagged yet so the banner is
 *  never empty. */
export async function getHotProductsAsync(limit = 4): Promise<CatalogItemWithMeta[]> {
  const all = await getAllProductsAsync();
  const flagged = all.filter((p) => p.isHot);
  if (flagged.length > 0) {
    return [...flagged].sort((a, b) => b.dateUpdated.localeCompare(a.dateUpdated)).slice(0, limit);
  }
  return [...all].sort((a, b) => b.rating - a.rating).slice(0, limit);
}

/** Admin-flagged "top" products (Products admin → ⭐ Mark as top), most
 *  recently flagged first (see getHotProductsAsync). Falls back to
 *  top-rated when nothing has been flagged yet. */
export async function getFeaturedProductsAsync(limit = 6): Promise<CatalogItemWithMeta[]> {
  const all = await getAllProductsAsync();
  const flagged = all.filter((p) => p.isFeatured);
  if (flagged.length > 0) {
    return [...flagged].sort((a, b) => b.dateUpdated.localeCompare(a.dateUpdated)).slice(0, limit);
  }
  return [...all].sort((a, b) => b.rating - a.rating).slice(0, limit);
}

export async function getAllBrandsAsync(): Promise<CatalogBrand[]> {
  const [brands, products] = await Promise.all([
    backendFetch<BackendBrand[]>("/api/brands/all"),
    fetchAllProductsRaw(),
  ]);

  return brands
    .map((b) => {
      const owned = products.filter((p) => p.brand.id === b.id);
      const categories = Array.from(new Set(owned.map((p) => TYPE_TO_CATEGORY[p.productType])));
      const topRating = owned.length ? Math.max(...owned.map((p) => p.rating)) : 0;
      return {
        name: b.name,
        slug: b.slug,
        count: owned.length,
        gradient: b.gradient ?? "from-slate-500 via-slate-300 to-amber-200",
        colorway: b.colorway,
        topRating,
        categories,
      };
    })
    .filter((b) => b.count > 0)
    .sort((a, b) => b.count - a.count);
}

// --- News ---

function toNewsArticle(n: BackendNews): NewsArticle {
  return {
    slug: n.slug,
    title: n.title,
    excerpt: n.excerpt,
    body: n.body,
    image: n.image ?? "",
    imageAlt: n.imageAlt ?? n.title,
    category: n.category,
    date: n.date.slice(0, 10),
    author: n.author,
  };
}

export async function getNewsAsync(): Promise<NewsArticle[]> {
  const res = await backendFetch<{ data: BackendNews[] }>("/api/news?pageSize=100");
  return res.data.map(toNewsArticle);
}

/** Overall market trend — every product's real price-snapshot history,
 *  indexed to 100 at its own first snapshot and combined into one average
 *  line (carrying each product's last known price forward into months it
 *  has no new snapshot for). With only one snapshot per product so far this
 *  will read as a flat 100 — that's honest: real history builds up as
 *  admins update prices over time, instead of a fabricated 6-month curve. */
export async function getOverallPriceIndexAsync(): Promise<PricePoint[]> {
  const raw = await fetchAllProductsRaw();
  const withHistory = raw.filter((p) => p.priceHistory.length > 0);
  if (withHistory.length === 0) return [];

  const monthKey = (iso: string) => iso.slice(0, 7); // "YYYY-MM"
  const allMonths = new Set<string>();
  for (const p of withHistory) for (const h of p.priceHistory) allMonths.add(monthKey(h.recordedAt));
  const months = Array.from(allMonths).sort();

  const series = withHistory.map((p) => {
    const sorted = [...p.priceHistory].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
    const base = sorted[0].avgPrice;
    const byMonth = new Map(sorted.map((h) => [monthKey(h.recordedAt), h.avgPrice]));

    let last = base;
    return months.map((m) => {
      const value = byMonth.get(m);
      if (value !== undefined) last = value;
      return (last / base) * 100;
    });
  });

  return months.map((m, i) => {
    const avg = series.reduce((sum, s) => sum + s[i], 0) / series.length;
    const label = new Date(`${m}-01`).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    return { label, value: avg };
  });
}

/** Every distinct market/city pair actually present in admin-entered market
 *  price data, grouped by city — replaces the old hard-coded market list. */
export function marketsByCityFromItems(items: CatalogItemWithMeta[]) {
  const seen = new Map<string, { name: string; city: string }>();
  for (const item of items) {
    for (const rate of item.marketRates) {
      seen.set(`${rate.city}::${rate.market}`, { name: rate.market, city: rate.city });
    }
  }
  const cityOrder = ["Lahore", "Karachi", "Islamabad"];
  const all = Array.from(seen.values());
  const cities = Array.from(new Set(all.map((m) => m.city))).sort(
    (a, b) => cityOrder.indexOf(a) - cityOrder.indexOf(b) || a.localeCompare(b)
  );
  return cities.map((city) => ({ city, markets: all.filter((m) => m.city === city) }));
}
