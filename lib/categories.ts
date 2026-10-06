// Central catalog registry — the fixed set of categories every product
// belongs to (mirrors the backend's ProductType enum). Actual product/brand
// data is fetched from the database through lib/backend-data.ts; this file
// only carries category metadata and the shared CatalogItem/CatalogBrand
// shapes that module maps backend results into.

export type CategoryDef = {
  slug: string;
  label: string;
  emoji: string;
  basePath: string;
};

export const CATEGORIES: CategoryDef[] = [
  { slug: "phones", label: "Phones", emoji: "📱", basePath: "/phones" },
  { slug: "laptops", label: "Laptops", emoji: "💻", basePath: "/laptops" },
  { slug: "desktops", label: "Desktops", emoji: "🖥️", basePath: "/desktops" },
  { slug: "gaming", label: "Gaming Zone", emoji: "🎮", basePath: "/gaming" },
  { slug: "accessories", label: "Accessories & Parts", emoji: "🎧", basePath: "/accessories" },
];

/** Emoji for a category slug (falls back to a generic tag icon for an
 *  unregistered slug rather than throwing). */
export function getCategoryEmoji(categorySlug: string): string {
  return CATEGORIES.find((c) => c.slug === categorySlug)?.emoji ?? "🏷️";
}

export type SpecEntry = { icon: string; label: string; value: string };

export type CatalogItem = {
  slug: string;
  brand: string;
  name: string;
  tagline: string;
  price: string;
  releaseYear: number;
  rating: number;
  tags: string[];
  gradient: string;
  colorway: string[];
  image: string;
  imageAlt: string;
  gallery: { src: string; alt: string }[];
  verdict: string;
  pros: string[];
  cons: string[];
  category: string;
  basePath: string;
  /** A handful of headline specs, normalized across categories (different
   *  spec shapes per category) for compact UI like the homepage reel card. */
  quickSpecs: SpecEntry[];
  /** A couple of "second screen" specs — camera+battery for a phone,
   *  display+battery for a laptop, capacity+battery for an accessory. */
  highlightSpecs: SpecEntry[];
};

export type CatalogBrand = {
  name: string;
  slug: string;
  count: number;
  gradient: string;
  colorway: string[];
  topRating: number;
  categories: string[];
};
