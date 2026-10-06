import { notFound } from "next/navigation";
import { getGamingDevices } from "@/lib/backend-data";
import { slugifyBrand } from "@/lib/phones";
import ProductDetail, { type SpecRow } from "@/components/ProductDetail";

const SPEC_LABELS: Record<string, { label: string; icon: string }> = {
  type: { label: "Type", icon: "🏷️" },
  compatibility: { label: "Compatibility", icon: "🔗" },
  capacity: { label: "Capacity", icon: "💾" },
  connector: { label: "Connector", icon: "🔌" },
  battery: { label: "Battery", icon: "🔋" },
  weight: { label: "Weight", icon: "⚖️" },
};

export default async function GamingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gamingDevices = await getGamingDevices();
  const device = gamingDevices.find((g) => g.slug === slug);
  if (!device) notFound();

  const specRows: SpecRow[] = (Object.keys(SPEC_LABELS) as (keyof typeof device.specs)[]).map(
    (key) => ({
      label: SPEC_LABELS[key].label,
      value: device.specs[key],
      icon: SPEC_LABELS[key].icon,
    })
  );

  const highlights = [
    {
      title: "Design and build",
      body: `${device.brand} builds the ${device.name} around how it's actually held or set up during play — the ergonomics and materials hold up to long sessions.`,
    },
    {
      title: "The gaming experience",
      body: `It's tuned for what people actually play on it — the kind of device that gets picked up for a quick session and stays out for hours without complaint.`,
    },
    {
      title: "Value for money",
      body: `At this price, it holds its own against pricier alternatives, and it's the kind of gear that earns a permanent spot in a gaming setup.`,
    },
  ];

  return (
    <ProductDetail
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Gaming Zone", href: "/gaming" },
        { label: device.brand, href: `/gaming?brand=${slugifyBrand(device.brand)}` },
        { label: device.name },
      ]}
      product={{
        slug: device.slug,
        category: "gaming",
        brand: device.brand,
        name: device.name,
        tagline: device.tagline,
        price: device.price,
        releaseYear: device.releaseYear,
        rating: device.rating,
        tags: device.tags,
        gradient: device.gradient,
        gallery: device.gallery,
        verdict: device.verdict,
        verdictIntro: `${device.verdict} It balances build quality, performance, and price in a way that's easy to recommend.`,
        verdictBody: `The ${device.name} is the kind of gaming gear that feels considered rather than an afterthought. It does its job reliably without unnecessary compromises.`,
        pros: device.pros,
        cons: device.cons,
        marketRates: device.marketRates,
        priceHistory: device.priceHistory,
      }}
      specRows={specRows}
      highlights={highlights}
    />
  );
}
