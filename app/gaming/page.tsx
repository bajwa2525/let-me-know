import Link from "next/link";
import { getGamingDevices, brandsFromItems } from "@/lib/backend-data";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import Reveal from "@/components/Reveal";

export default async function GamingPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand: brandSlug } = await searchParams;
  const gamingDevices = await getGamingDevices();
  const brands = brandsFromItems(gamingDevices);
  const activeBrand = brandSlug ? brands.find((b) => b.slug === brandSlug) : undefined;

  const visible = activeBrand
    ? gamingDevices.filter((g) => g.brand === activeBrand.name)
    : gamingDevices;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Gaming Zone", href: "/gaming" },
            ...(activeBrand ? [{ label: activeBrand.name }] : []),
          ]}
        />
        <h1 className="mb-3 text-3xl font-bold sm:text-4xl">
          The <span className="text-gradient">Gaming Zone</span>
        </h1>
        <p className="mb-8 max-w-xl text-sm text-muted">
          {gamingDevices.length} consoles, handhelds, and gear — everything for
          the gaming setup.
        </p>

        <div className="mb-10 flex flex-wrap gap-2">
          <Link
            href="/gaming"
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              !activeBrand
                ? "border-transparent bg-white text-slate-900"
                : "border-white/10 bg-white/5 text-muted hover:text-foreground"
            }`}
          >
            All brands
          </Link>
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/gaming?brand=${brand.slug}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                activeBrand?.slug === brand.slug
                  ? "border-transparent bg-white text-slate-900"
                  : "border-white/10 bg-white/5 text-muted hover:text-foreground"
              }`}
            >
              {brand.name} ({brand.count})
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((item, i) => (
            <Reveal key={item.slug} delayMs={(i % 8) * 50}>
              <ProductCard product={item} basePath="/gaming" />
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}
