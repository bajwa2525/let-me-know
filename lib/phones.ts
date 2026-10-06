// Type + pure-helper module for the "phones" category. All product data now
// lives in the database and is fetched through lib/backend-data.ts — this
// file no longer carries a static dataset, only the shared shape and small
// formatting helpers other modules still depend on.

export type PhoneSpec = {
  display: string;
  chipset: string;
  ram: string;
  storage: string;
  battery: string;
  camera: string;
  os: string;
  weight: string;
};

export type Phone = {
  slug: string;
  brand: string;
  name: string;
  tagline: string;
  price: string;
  releaseYear: number;
  rating: number; // out of 10
  tags: string[];
  gradient: string; // background accent behind the product photo
  colorway: string[]; // used by the vector fallback illustration
  image: string;
  imageAlt: string;
  gallery: { src: string; alt: string }[];
  specs: PhoneSpec;
  verdict: string;
  pros: string[];
  cons: string[];
};

export const tabs = ["Overview", "Specs", "Camera & Battery", "Verdict"] as const;
export type TabName = (typeof tabs)[number];

export function slugifyBrand(brand: string): string {
  return brand
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Re-exported for backwards compatibility — the tiering logic is shared
// across categories (phones, laptops, ...) and lives in lib/pricing.ts.
export { getPriceTier } from "./pricing";
export type { PriceTier } from "./pricing";
