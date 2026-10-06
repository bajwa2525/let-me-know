import Link from "next/link";
import { getPhones, brandsFromItems } from "@/lib/backend-data";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import Reveal from "@/components/Reveal";

export default async function PhonesPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand: brandSlug } = await searchParams;
  const phones = await getPhones();
  const brands = brandsFromItems(phones);
  const activeBrand = brandSlug ? brands.find((b) => b.slug === brandSlug) : undefined;
  const visible = activeBrand ? phones.filter((p) => p.brand === activeBrand.name) : phones;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Phones", href: "/phones" },
            ...(activeBrand ? [{ label: activeBrand.name }] : []),
          ]}
        />
        <h1 className="mb-3 text-3xl font-bold sm:text-4xl">
          Every <span className="text-gradient">phone</span> we track
        </h1>
        <p className="mb-8 max-w-xl text-sm text-muted">
          {phones.length} phones, real specs, real photos — browse the full lineup.
        </p>

        <div className="mb-10 flex flex-wrap gap-2">
          <Link
            href="/phones"
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
              href={`/phones?brand=${brand.slug}`}
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
          {visible.map((phone, i) => (
            <Reveal key={phone.slug} delayMs={(i % 8) * 50}>
              <ProductCard product={phone} basePath="/phones" />
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}
