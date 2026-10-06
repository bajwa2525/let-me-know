import Link from "next/link";
import type { MarketRate, PricePoint } from "@/lib/market";
import PriceTrendChart from "@/components/PriceTrendChart";

export default function MarketPriceBoard({
  rates,
  history,
}: {
  /** Real, admin-entered per-market prices from the database. */
  rates: MarketRate[];
  /** Real recorded price-snapshot history — one point per time an admin
   *  updated this product's market prices. Builds up over time. */
  history: PricePoint[];
}) {
  const byCity = new Map<string, typeof rates>();
  for (const rate of rates) {
    const list = byCity.get(rate.city) ?? [];
    list.push(rate);
    byCity.set(rate.city, list);
  }

  if (rates.length === 0) {
    return (
      <div className="glass rounded-[28px] p-6 md:p-8">
        <p className="mb-1 text-xs uppercase tracking-[0.22em] text-muted">Pakistan market rates</p>
        <h2 className="mb-2 text-2xl font-bold tracking-tight">What it costs locally</h2>
        <p className="text-sm text-muted">No market pricing has been added for this product yet.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-[28px] p-6 md:p-8">
      <p className="mb-1 text-xs uppercase tracking-[0.22em] text-muted">Pakistan market rates</p>
      <h2 className="mb-5 text-2xl font-bold tracking-tight">What it costs locally</h2>

      <div className="mb-6 space-y-5">
        {[...byCity.entries()].map(([city, cityRates]) => (
          <div key={city}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{city}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {cityRates.map((rate) => (
                <div
                  key={rate.market}
                  className={`relative rounded-2xl border p-4 ${
                    rate.isBest
                      ? "border-emerald-400/40 bg-emerald-400/5"
                      : "border-white/10 bg-white/3"
                  }`}
                >
                  {rate.isBest && (
                    <span className="absolute right-3 top-3 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-400">
                      Best price
                    </span>
                  )}
                  <p className="mb-3 text-sm font-semibold leading-tight">{rate.market}</p>
                  <p className="text-xl font-bold text-gradient">{rate.priceLabel}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
        <p className="mb-3 text-xs uppercase tracking-[0.16em] text-muted">Price trend (PKR)</p>
        {history.length >= 2 ? (
          <PriceTrendChart history={history} />
        ) : (
          <p className="py-6 text-center text-xs text-muted">
            Not enough price history yet — this builds up as prices are updated over time.
          </p>
        )}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        Rates are entered and kept up to date by our team across {rates.length} markets in
        Lahore, Karachi, and Islamabad — actual in-store prices vary by vendor
        and change daily. See the full{" "}
        <Link href="/markets" className="underline hover:text-foreground">
          markets overview
        </Link>
        .
      </p>
    </div>
  );
}
