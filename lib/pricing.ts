export type PriceTier = {
  label: string;
  emoji: string;
  className: string;
};

/** Buckets a product's launch price (a "$999"-style string) into a friendly
 *  tier badge, regardless of brand or category. */
export function getPriceTier(price: string): PriceTier {
  const value = Number(price.replace(/[^0-9.]/g, "")) || 0;

  if (value >= 950) {
    return {
      label: "Premium",
      emoji: "💎",
      className: "from-violet-500/25 to-fuchsia-500/25 text-(--tier-premium-text) ring-violet-400/30",
    };
  }
  if (value >= 750) {
    return {
      label: "Popular Pick",
      emoji: "🔥",
      className: "from-orange-500/25 to-rose-500/25 text-(--tier-popular-text) ring-orange-400/30",
    };
  }
  return {
    label: "Great Value",
    emoji: "💰",
    className: "from-emerald-500/25 to-teal-500/25 text-(--tier-value-text) ring-emerald-400/30",
  };
}
