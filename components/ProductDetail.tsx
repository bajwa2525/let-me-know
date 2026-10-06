import SpecVerification from "@/components/SpecVerification";
import PriceBox from "@/components/PriceBox";
import Breadcrumbs, { type Crumb } from "@/components/Breadcrumbs";
import PhoneGallery from "@/components/PhoneGallery";
import MarketPriceBoard from "@/components/MarketPriceBoard";
import type { MarketRate, PricePoint } from "@/lib/market";

export type SpecRow = { label: string; value: string; icon: string };

export type ProductDetailData = {
  slug: string;
  category: string;
  brand: string;
  name: string;
  tagline: string;
  price: string;
  releaseYear: number;
  rating: number;
  tags: string[];
  gradient: string;
  gallery: { src: string; alt: string }[];
  verdict: string;
  verdictIntro: string;
  verdictBody: string;
  pros: string[];
  cons: string[];
  marketRates: MarketRate[];
  priceHistory: PricePoint[];
};

const MOCK_COMMENTS = [
  {
    user: "Ahsan",
    time: "2 hours ago",
    text: "Looks like a strong all-rounder for someone who wants premium features without going overboard. The build quality and battery feel like the real win here.",
  },
  {
    user: "Nadia",
    time: "5 hours ago",
    text: "I like the way the page explains the value clearly. The build and software feel more premium than the price suggests, and the gallery makes it easier to compare the angles.",
  },
  {
    user: "Zain",
    time: "Yesterday",
    text: "For daily use, this is exactly the kind of device I'd recommend. It isn't trying to be too flashy, it just works well and feels complete.",
  },
];

export default function ProductDetail({
  breadcrumbs,
  product,
  specRows,
  highlights,
}: {
  breadcrumbs: Crumb[];
  product: ProductDetailData;
  specRows: SpecRow[];
  highlights: { title: string; body: string }[];
}) {
  return (
    <main className="flex-1 overflow-x-hidden">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />

        <div className="glass mb-8 overflow-hidden rounded-[28px] border border-white/10">
          <div className="grid gap-6 p-4 md:p-6 lg:grid-cols-[1.45fr_0.95fr] lg:p-8">
            <div className="flex flex-col justify-center">
              <div className="mb-3 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-foreground/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted">
                {product.brand} • {product.releaseYear}
              </p>
              <h1 className="mb-3 text-4xl font-black tracking-tight md:text-5xl">{product.name}</h1>
              <p className="mb-5 max-w-xl text-base leading-relaxed text-muted">{product.tagline}</p>

              <div className="mb-5 flex flex-wrap items-center gap-4">
                <PriceBox price={product.price} size="lg" />
                <span className="text-sm text-muted">★ {product.rating.toFixed(1)} / 10</span>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-foreground/80">
                <button className="rounded-full bg-white px-4 py-2 font-medium text-slate-900 transition hover:opacity-90">
                  Buy now
                </button>
                <button className="rounded-full border border-white/15 bg-transparent px-4 py-2 font-medium transition hover:border-white/30 hover:bg-white/5">
                  Compare
                </button>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-2">
              <PhoneGallery images={product.gallery} layout="hero" gradient={product.gradient} />
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_360px]">
          <article className="space-y-8">
            <div className="glass rounded-[28px] p-6 md:p-8">
              <p className="mb-2 text-xs uppercase tracking-[0.22em] text-muted">Overview</p>
              <h2 className="mb-4 text-3xl font-bold tracking-tight">Why this stands out</h2>
              <p className="mb-4 text-base leading-8 text-foreground/90">{product.verdictIntro}</p>
              <p className="text-base leading-8 text-muted">{product.verdictBody}</p>
            </div>

            <div className="glass rounded-[28px] p-6 md:p-8">
              <p className="mb-5 text-xs uppercase tracking-[0.22em] text-muted">In depth</p>
              <div className="space-y-5">
                {highlights.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/3 p-4 md:p-5">
                    <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                    <p className="text-sm leading-7 text-muted">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-[28px] p-6 md:p-8">
              <p className="mb-5 text-xs uppercase tracking-[0.22em] text-muted">Gallery</p>
              {product.gallery.length > 1 && <PhoneGallery images={product.gallery} layout="grid" />}
            </div>

            <div className="glass rounded-[28px] p-6 md:p-8">
              <p className="mb-5 text-xs uppercase tracking-[0.22em] text-muted">Full specifications</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {specRows.map((row) => (
                  <div key={row.label} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/3 p-4">
                    <span className="text-xl">{row.icon}</span>
                    <div>
                      <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-muted">{row.label}</p>
                      <p className="text-sm font-medium leading-snug text-foreground/90">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-[28px] p-6 md:p-8">
              <p className="mb-5 text-xs uppercase tracking-[0.22em] text-muted">Verdict</p>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="mb-3 text-sm font-semibold text-emerald-400">Pros</p>
                  <ul className="space-y-2 text-sm text-muted">
                    {product.pros.map((p) => (
                      <li key={p} className="flex gap-2">
                        <span>•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-3 text-sm font-semibold text-rose-400">Cons</p>
                  <ul className="space-y-2 text-sm text-muted">
                    {product.cons.map((c) => (
                      <li key={c} className="flex gap-2">
                        <span>•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <MarketPriceBoard rates={product.marketRates} history={product.priceHistory} />

            <div className="glass rounded-[28px] p-6 md:p-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">Comments</p>
                  <h3 className="mt-1 text-2xl font-bold">Community discussion</h3>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted">
                  {MOCK_COMMENTS.length} comments
                </span>
              </div>

              <div className="mb-6 rounded-2xl border border-white/10 bg-white/3 p-4">
                <textarea
                  rows={4}
                  placeholder="Write your opinion..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-foreground outline-none placeholder:text-muted focus:border-white/25"
                />
                <div className="mt-3 flex justify-end">
                  <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:opacity-90">
                    Post comment
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {MOCK_COMMENTS.map((comment) => (
                  <div key={comment.user + comment.time} className="rounded-2xl border border-white/10 bg-white/3 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-bold text-white">
                          {comment.user[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{comment.user}</p>
                          <p className="text-[11px] text-muted">{comment.time}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm leading-7 text-foreground/85">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <SpecVerification slug={product.slug} category={product.category} />
          </article>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-col gap-6">
              <div className="glass w-full rounded-[28px] p-5">
                <p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted">Quick facts</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
                    <span className="text-sm text-muted">Price</span>
                    <span className="text-sm font-semibold">{product.price}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
                    <span className="text-sm text-muted">Rating</span>
                    <span className="text-sm font-semibold">{product.rating.toFixed(1)}/10</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2">
                    <span className="text-sm text-muted">Launch</span>
                    <span className="text-sm font-semibold">{product.releaseYear}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 pb-1">
                    <span className="text-sm text-muted">Category</span>
                    <span className="text-sm font-semibold capitalize">{product.category}</span>
                  </div>
                </div>
              </div>

              <div className="glass w-full rounded-[28px] p-5">
                <p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted">Highlights</p>
                <ul className="space-y-3 text-sm text-muted">
                  {highlights.slice(0, 4).map((item) => (
                    <li key={item.title} className="rounded-xl border border-white/10 bg-white/3 p-3 leading-relaxed">
                      {item.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
