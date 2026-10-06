import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/categories";
import { getAllProductsAsync } from "@/lib/backend-data";
import Breadcrumbs from "@/components/Breadcrumbs";
import PriceBox from "@/components/PriceBox";
import Reveal from "@/components/Reveal";

const TABS = [{ slug: "all", label: "All", emoji: "🏷️" }, ...CATEGORIES];

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const activeTab = TABS.find((t) => t.slug === category) ?? TABS[0];

  const allProducts = await getAllProductsAsync();
  const reviews = allProducts
    .filter((p) => activeTab.slug === "all" || p.category === activeTab.slug)
    .sort((a, b) => b.rating - a.rating);

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Reviews" }]} />
        <h1 className="mb-3 text-3xl font-bold sm:text-4xl">
          Our <span className="text-gradient">reviews</span>
        </h1>
        <p className="mb-8 max-w-xl text-sm text-muted">
          Every product we&apos;ve reviewed, ranked by rating — with a full verdict,
          pros, cons, and pricing on each detail page.
        </p>

        <div className="mb-10 flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <Link
              key={tab.slug}
              href={tab.slug === "all" ? "/reviews" : `/reviews?category=${tab.slug}`}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab.slug === tab.slug
                  ? "border-transparent bg-white text-slate-900"
                  : "border-white/10 bg-white/5 text-muted hover:text-foreground"
              }`}
            >
              <span>{tab.emoji}</span>
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="space-y-4">
          {reviews.map((product, i) => (
            <Reveal key={`${product.basePath}-${product.slug}`} delayMs={i * 50}>
              <Link
                href={`${product.basePath}/${product.slug}`}
                className="glass group flex gap-4 rounded-2xl p-4 transition-transform hover:-translate-y-1 sm:gap-5 sm:p-5"
              >
                <div
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${product.gradient} sm:h-24 sm:w-24`}
                >
                  <Image
                    src={product.image}
                    alt={product.imageAlt}
                    fill
                    sizes="120px"
                    className="object-contain p-2"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2 text-[11px] text-muted">
                    <span className="rounded-full bg-white/10 px-2 py-0.5 capitalize">
                      {product.category}
                    </span>
                    <span>★ {product.rating.toFixed(1)} / 10</span>
                  </div>
                  <h2 className="mb-1 font-semibold leading-snug">
                    {product.brand} {product.name}
                  </h2>
                  <p className="mb-2 line-clamp-2 text-sm text-muted">{product.verdict}</p>
                  <PriceBox price={product.price} size="sm" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}
