import { notFound } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { getAllBrandsAsync, getAllProductsAsync } from "@/lib/backend-data";
import ProductCard from "@/components/ProductCard";
import BrandIcon from "@/components/BrandIcon";
import Breadcrumbs from "@/components/Breadcrumbs";

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: brandSlug } = await params;
  const [allBrands, allProducts] = await Promise.all([getAllBrandsAsync(), getAllProductsAsync()]);
  const brand = allBrands.find((b) => b.slug === brandSlug);
  if (!brand) notFound();

  // Aggregated across every category — a brand like Apple or Samsung can
  // show phones, laptops, and accessories side by side, grouped so each
  // category stays visually distinct rather than one mixed grid.
  const brandProducts = allProducts.filter((p) => p.brand === brand.name);
  const groups = CATEGORIES.map((c) => ({
    category: c,
    products: brandProducts.filter((p) => p.category === c.slug),
  })).filter((g) => g.products.length > 0);

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Brands", href: "/brands" },
            { label: brand.name },
          ]}
        />

        <div className="mb-10 flex items-center gap-4">
          <BrandIcon categories={brand.categories} gradient={brand.gradient} size="lg" />
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">{brand.name}</h1>
            <p className="text-sm text-muted">
              {brand.count} {brand.count === 1 ? "product" : "products"} • best rated ★{" "}
              {brand.topRating.toFixed(1)}
            </p>
          </div>
        </div>

        <div className="space-y-10">
          {groups.map(({ category, products }) => (
            <section key={category.slug}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <span>{category.emoji}</span>
                {category.label}
                <span className="text-xs font-normal text-muted">({products.length})</span>
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={`${product.basePath}-${product.slug}`}
                    product={product}
                    basePath={product.basePath}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
