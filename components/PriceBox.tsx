import { getPriceTier } from "@/lib/phones";

export default function PriceBox({
  price,
  size = "md",
  animated = false,
}: {
  price: string;
  size?: "sm" | "md" | "lg";
  /** Subtle pulse + shimmer, for high-attention spots like leaderboards. */
  animated?: boolean;
}) {
  const tier = getPriceTier(price);

  const sizes = {
    sm: { price: "text-base", badge: "text-[9px] px-1.5 py-0.5", gap: "gap-1.5" },
    md: { price: "text-lg", badge: "text-[10px] px-2 py-0.5", gap: "gap-2" },
    lg: { price: "text-2xl", badge: "text-xs px-2.5 py-1", gap: "gap-3" },
  }[size];

  return (
    <div className={`inline-flex flex-wrap items-center ${sizes.gap}`}>
      <span className={`font-semibold text-gradient ${sizes.price}`}>{price}</span>
      <span
        className={`relative inline-flex items-center gap-1 overflow-hidden rounded-full bg-gradient-to-r ${tier.className} ring-1 font-medium ${sizes.badge} ${
          animated ? "animate-[pricepulse_2.4s_ease-in-out_infinite]" : ""
        }`}
      >
        <span>{tier.emoji}</span>
        {tier.label}
        {animated && (
          <span
            aria-hidden
            className="absolute inset-0 -translate-x-full animate-[priceshimmer_2.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent"
          />
        )}
      </span>
    </div>
  );
}
