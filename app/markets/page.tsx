import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import PriceTrendChart from "@/components/PriceTrendChart";
import { getAllProductsAsync, marketsByCityFromItems, getOverallPriceIndexAsync } from "@/lib/backend-data";

export default async function MarketsPage() {
  const [products, overallIndex] = await Promise.all([
    getAllProductsAsync(),
    getOverallPriceIndexAsync(),
  ]);
  const cityGroups = marketsByCityFromItems(products);

  // Cheapest current market rate per product (skipping any with no market
  // data yet), sorted priciest first.
  const productRates = products
    .filter((p) => p.marketRates.length > 0)
    .map((p) => ({ product: p, rates: p.marketRates }))
    .sort((a, b) => b.rates[0].price - a.rates[0].price);

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Markets" }]} />
        <h1 className="mb-3 text-3xl font-bold sm:text-4xl">
          Pakistan <span className="text-gradient">tech markets</span>
        </h1>
        <p className="mb-10 max-w-2xl text-sm text-muted">
          Estimated retail rates across {cityGroups.reduce((n, g) => n + g.markets.length, 0)}{" "}
          well-known markets in {cityGroups.map((g) => g.city).join(", ")} — plus an overall
          market trend and a per-product price breakdown.
        </p>

        {/* Markets by city */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold">Markets we track</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {cityGroups.map((group) => (
              <div key={group.city} className="glass rounded-2xl p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
                  {group.city}
                </p>
                <ul className="space-y-2">
                  {group.markets.map((m) => (
                    <li
                      key={m.name}
                      className="rounded-xl border border-white/10 bg-white/3 px-3 py-2 text-sm"
                    >
                      {m.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Overall index */}
        <section className="glass mb-12 rounded-[28px] p-6 md:p-8">
          <p className="mb-1 text-xs uppercase tracking-[0.22em] text-muted">
            Overall market trend
          </p>
          <h2 className="mb-1 text-2xl font-bold tracking-tight">
            Price index across every product
          </h2>
          <p className="mb-5 max-w-2xl text-sm text-muted">
            Every product&apos;s price is indexed to 100 at its first recorded snapshot so
            phones, laptops, and accessories — despite very different price tags — combine
            into one comparable trend line. Real history recorded whenever prices are
            updated, so this grows richer over time.
          </p>
          {overallIndex.length >= 2 ? (
            <PriceTrendChart history={overallIndex} format="index" height="h-56" />
          ) : (
            <p className="py-10 text-center text-sm text-muted">
              Not enough price history yet across the catalog — check back as prices get updated.
            </p>
          )}
        </section>

        {/* Product-wise pricing */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">Product-wise pricing</h2>
          <div className="glass overflow-hidden rounded-2xl">
            {productRates.map(({ product, rates }) => (
              <Link
                key={`${product.basePath}-${product.slug}`}
                href={`${product.basePath}/${product.slug}`}
                className="flex items-center justify-between gap-4 border-b border-border/50 px-5 py-3 transition-colors last:border-0 hover:bg-(--overlay)"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {product.brand} {product.name}
                  </p>
                  <p className="text-xs text-muted capitalize">{product.category}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-gradient">{rates[0].priceLabel}</p>
                  <p className="text-[11px] text-muted">best · {rates[0].market}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
