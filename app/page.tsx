import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductReel from "@/components/ProductReel";
import BrandIcon from "@/components/BrandIcon";
import HotModelsBanner from "@/components/HotModelsBanner";
import TopInterestList from "@/components/TopInterestList";
import Reveal from "@/components/Reveal";
import { CATEGORIES } from "@/lib/categories";
import { getAllProductsAsync, getAllBrandsAsync, getHotProductsAsync, getFeaturedProductsAsync } from "@/lib/backend-data";

const CATEGORY_TILE_GRADIENTS: Record<string, string> = {
  phones: "from-violet-500/20 to-fuchsia-500/20",
  laptops: "from-sky-500/20 to-emerald-500/20",
  desktops: "from-cyan-500/20 to-blue-500/20",
  gaming: "from-indigo-500/20 to-purple-500/20",
  accessories: "from-amber-500/20 to-rose-500/20",
};

export default async function Home() {
  const [products, brands, hotProducts, featuredProducts] = await Promise.all([
    getAllProductsAsync(),
    getAllBrandsAsync(),
    getHotProductsAsync(4),
    getFeaturedProductsAsync(6),
  ]);

  const categoryCounts = CATEGORIES.map((c) => ({
    ...c,
    count: products.filter((p) => p.category === c.slug).length,
  }));

  return (
    <main className="flex-1">
      {/* Hero — compact: the reel below is the pitch, not this copy. */}
      <section className="mx-auto max-w-5xl px-6 pb-6 pt-10 text-center sm:pb-8 sm:pt-14">
        <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-5xl">
          Find your next device, <span className="text-accent">the fast way</span>
        </h1>
        <p className="mx-auto max-w-lg text-sm text-muted">
          Swipe through top-rated phones, laptops &amp; gear like a reel — left/right
          for the next device, up/down to switch category.
        </p>
      </section>

      {/* Reel — the core interaction, its own immersive full screen. */}
      <div className="pb-14">
        <ProductReel products={products} />
      </div>

      {/* Categories — every registered category (lib/categories.ts) shows up
          here automatically, so a new category never needs a homepage edit. */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {categoryCounts.map((category, i) => (
            <Reveal key={category.basePath} delayMs={i * 50}>
              <Link
                href={category.basePath}
                className={`card-shine glass flex flex-col items-center gap-2 rounded-2xl bg-linear-to-br p-4 text-center shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-1.5 ${
                  CATEGORY_TILE_GRADIENTS[category.slug] ?? "from-white/10 to-white/5"
                }`}
              >
                <span className="text-2xl">{category.emoji}</span>
                <div>
                  <p className="text-xs font-semibold leading-tight sm:text-sm">{category.label}</p>
                  <p className="text-[11px] text-muted">{category.count} listed</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <HotModelsBanner products={hotProducts} />

      {/* Grid + leaderboard — aggregated across every category. Dense grid
          so as many products as possible are visible per scroll. */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-2">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="mb-5 flex items-end justify-between">
              <h2 className="text-xl font-semibold sm:text-2xl">Trending this week</h2>
              <span className="text-xs text-muted">{products.length} products</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:gap-4">
              {products.map((product, i) => (
                <Reveal key={`${product.basePath}-${product.slug}`} delayMs={(i % 9) * 50}>
                  <ProductCard product={product} basePath={product.basePath} />
                </Reveal>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <TopInterestList products={featuredProducts} />
          </div>
        </div>
      </section>

      {/* Brands — aggregated across every category */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-xl font-semibold sm:text-2xl">Shop by brand</h2>
          <Link href="/brands" className="text-xs text-muted hover:text-foreground">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
          {brands.map((brand, i) => (
            <Reveal key={brand.slug} delayMs={(i % 8) * 50}>
              <Link
                href={`/brands/${brand.slug}`}
                className="card-shine glass flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center transition-transform duration-300 hover:-translate-y-1.5"
              >
                <BrandIcon categories={brand.categories} gradient={brand.gradient} />
                <span className="text-[11px] font-medium leading-tight">{brand.name}</span>
                <span className="text-[10px] text-muted">
                  {brand.count} {brand.count === 1 ? "product" : "products"}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
