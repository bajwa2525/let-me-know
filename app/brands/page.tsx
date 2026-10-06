import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { getAllBrandsAsync, getAllProductsAsync } from "@/lib/backend-data";
import BrandIcon from "@/components/BrandIcon";
import Breadcrumbs from "@/components/Breadcrumbs";

const TABS = [{ slug: "all", label: "All", emoji: "🏷️" }, ...CATEGORIES];

export default async function BrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const activeTab = TABS.find((t) => t.slug === category) ?? TABS[0];

  const [allBrands, allProducts] = await Promise.all([getAllBrandsAsync(), getAllProductsAsync()]);
  const brands =
    activeTab.slug === "all"
      ? allBrands
      : allBrands
          .filter((b) => b.categories.includes(activeTab.slug))
          .map((b) => {
            // Re-derive count/rating scoped to this one category, so a tab
            // shows "2 laptops" for Apple rather than its all-category total.
            const inCategory = allProducts.filter(
              (p) => p.brand === b.name && p.category === activeTab.slug
            );
            return {
              ...b,
              count: inCategory.length,
              topRating: Math.max(...inCategory.map((p) => p.rating)),
            };
          });

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Brands" }]} />
        <h1 className="mb-3 text-3xl font-bold sm:text-4xl">
          Browse by <span className="text-gradient">brand</span>
        </h1>
        <p className="mb-8 max-w-xl text-sm text-muted">
          Every brand we track — across phones, laptops, and accessories — with
          everything we&apos;ve reviewed so far. More brands and products are
          added every week.
        </p>

        {/* Category tabs — differentiate a phone brand from a laptop brand
            instead of guessing at one icon per brand. */}
        <div className="mb-10 flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <Link
              key={tab.slug}
              href={tab.slug === "all" ? "/brands" : `/brands?category=${tab.slug}`}
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

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/brands/${brand.slug}`}
              className="glass rounded-2xl p-5 transition-transform hover:-translate-y-1"
            >
              <div className="mb-4">
                <BrandIcon
                  categories={activeTab.slug === "all" ? brand.categories : [activeTab.slug]}
                  gradient={brand.gradient}
                  size="lg"
                />
              </div>
              <h2 className="mb-1 font-semibold">{brand.name}</h2>
              <p className="text-xs text-muted">
                {brand.count} {brand.count === 1 ? "product" : "products"} • best rated ★{" "}
                {brand.topRating.toFixed(1)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
