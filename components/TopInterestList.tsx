import Link from "next/link";
import type { CatalogItem } from "@/lib/categories";
import PriceBox from "@/components/PriceBox";

const RANK_STYLES = [
  "bg-gradient-to-br from-amber-300 to-yellow-600 text-black", // 1st
  "bg-gradient-to-br from-slate-300 to-slate-500 text-black", // 2nd
  "bg-gradient-to-br from-orange-400 to-orange-700 text-black", // 3rd
];

export default function TopInterestList({ products }: { products: CatalogItem[] }) {
  // Admin-flagged "top" products (Products admin → ⭐), already
  // ranked/limited by the caller.
  const ranked = products;

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <span className="text-lg">🔥</span>
        <h2 className="text-sm font-semibold sm:text-base">Top products by interest</h2>
      </div>

      <div>
        {ranked.map((phone, i) => (
          <Link
            key={`${phone.basePath}-${phone.slug}`}
            href={`${phone.basePath}/${phone.slug}`}
            className="flex items-center gap-4 border-b border-border/50 px-5 py-3 transition-colors last:border-0 hover:bg-(--overlay)"
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                RANK_STYLES[i] ?? "bg-(--overlay-strong) text-muted"
              }`}
            >
              {i + 1}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {phone.name.toLowerCase().startsWith(phone.brand.toLowerCase())
                  ? phone.name
                  : `${phone.brand} ${phone.name}`}
              </p>
              <p className="truncate text-xs text-muted">★ {phone.rating.toFixed(1)} · {phone.tagline}</p>
            </div>

            <PriceBox price={phone.price} size="sm" animated={i === 0} />
          </Link>
        ))}
      </div>
    </div>
  );
}
