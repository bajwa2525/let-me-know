// Small line-based text <-> structured-data helpers used by the admin
// product form, so gallery / specs / market-price rows can be edited as
// plain multi-line text instead of a dynamic repeating-row UI.
import type { MarketPrice, ProductImage } from "@/lib/api";

export function linesToList(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function tagsToText(tags: string[]): string {
  return tags.join(", ");
}
export function textToTags(text: string): string[] {
  return text
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function specsToText(specs?: Record<string, unknown> | null): string {
  if (!specs) return "";
  return Object.entries(specs)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}
export function textToSpecs(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of linesToList(text)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) out[key] = value;
  }
  return out;
}

export function galleryToText(gallery: ProductImage[]): string {
  return gallery.map((g) => (g.alt ? `${g.src} | ${g.alt}` : g.src)).join("\n");
}
export function textToGallery(text: string): ProductImage[] {
  return linesToList(text).map((line, i) => {
    const [src, alt] = line.split("|").map((p) => p.trim());
    return { src, alt: alt || undefined, sortOrder: i };
  });
}

export function marketPricesToText(prices: MarketPrice[]): string {
  return prices.map((p) => `${p.market}, ${p.city}, ${p.price}, ${p.stock ?? 0}`).join("\n");
}
export function textToMarketPrices(text: string): MarketPrice[] {
  return linesToList(text)
    .map((line) => {
      const [market, city, price, stock] = line.split(",").map((p) => p.trim());
      return { market, city, price: Number(price) || 0, stock: Number(stock) || 0 };
    })
    .filter((p) => p.market && p.city);
}
