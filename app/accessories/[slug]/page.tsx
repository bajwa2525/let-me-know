import { notFound } from "next/navigation";
import { getAccessories } from "@/lib/backend-data";
import { slugifyBrand } from "@/lib/phones";
import ProductDetail, { type SpecRow } from "@/components/ProductDetail";

const SPEC_LABELS: Record<string, { label: string; icon: string }> = {
  type: { label: "Type", icon: "🏷️" },
  compatibility: { label: "Compatibility", icon: "🔗" },
  capacity: { label: "Capacity", icon: "🔋" },
  connector: { label: "Connector", icon: "🔌" },
  battery: { label: "Battery", icon: "⏱️" },
  weight: { label: "Weight", icon: "⚖️" },
};

export default async function AccessoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const accessories = await getAccessories();
  const item = accessories.find((a) => a.slug === slug);
  if (!item) notFound();

  const specRows: SpecRow[] = (Object.keys(SPEC_LABELS) as (keyof typeof item.specs)[]).map(
    (key) => ({
      label: SPEC_LABELS[key].label,
      value: item.specs[key],
      icon: SPEC_LABELS[key].icon,
    })
  );

  const highlights = [
    {
      title: "Build and design",
      body: `${item.brand} keeps the ${item.name} focused on one job and does it well — the materials and fit feel appropriate for daily use rather than a corner-cut accessory.`,
    },
    {
      title: "Everyday use",
      body: `It slots into a normal routine without friction — set it up once and it just works alongside the phones and laptops it's meant to support.`,
    },
    {
      title: "Value for money",
      body: `At this price, it holds up well against pricier alternatives, and it's the kind of accessory that quietly earns its place in a bag rather than gathering dust.`,
    },
  ];

  return (
    <ProductDetail
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Accessories & Parts", href: "/accessories" },
        { label: item.brand, href: `/accessories?brand=${slugifyBrand(item.brand)}` },
        { label: item.name },
      ]}
      product={{
        slug: item.slug,
        category: "accessories",
        brand: item.brand,
        name: item.name,
        tagline: item.tagline,
        price: item.price,
        releaseYear: item.releaseYear,
        rating: item.rating,
        tags: item.tags,
        gradient: item.gradient,
        gallery: item.gallery,
        verdict: item.verdict,
        verdictIntro: `${item.verdict} It balances build quality, everyday usefulness, and price in a way that's easy to recommend.`,
        verdictBody: `The ${item.name} is the kind of accessory that feels considered rather than an afterthought. It does its one job reliably without unnecessary compromises.`,
        pros: item.pros,
        cons: item.cons,
        marketRates: item.marketRates,
        priceHistory: item.priceHistory,
      }}
      specRows={specRows}
      highlights={highlights}
    />
  );
}
