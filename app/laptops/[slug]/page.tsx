import { notFound } from "next/navigation";
import { getLaptops } from "@/lib/backend-data";
import { slugifyBrand } from "@/lib/phones";
import ProductDetail, { type SpecRow } from "@/components/ProductDetail";

const SPEC_ICONS: Record<string, string> = {
  Display: "🖥️",
  CPU: "⚙️",
  GPU: "🎮",
  RAM: "🧠",
  Storage: "💾",
  Battery: "🔋",
  OS: "💻",
  Weight: "⚖️",
};

export default async function LaptopDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const laptops = await getLaptops();
  const laptop = laptops.find((p) => p.slug === slug);
  if (!laptop) notFound();

  const specRows: SpecRow[] = [
    ["Display", laptop.specs.display],
    ["CPU", laptop.specs.cpu],
    ["GPU", laptop.specs.gpu],
    ["RAM", laptop.specs.ram],
    ["Storage", laptop.specs.storage],
    ["Battery", laptop.specs.battery],
    ["OS", laptop.specs.os],
    ["Weight", laptop.specs.weight],
  ].map(([label, value]) => ({ label, value, icon: SPEC_ICONS[label] }));

  const highlights = [
    {
      title: "Design and build",
      body: `${laptop.brand} builds the ${laptop.name} around a chassis that's meant to be carried daily — the materials, hinge feel, and overall fit and finish hold up well against far more expensive machines.`,
    },
    {
      title: "Performance and thermals",
      body: `Day-to-day performance is smooth for browsing, office work, and media, with enough headroom for light creative work. Thermals stay reasonable under normal use, only ramping up noticeably under sustained heavy load.`,
    },
    {
      title: "Battery and portability",
      body: `Battery life comfortably covers a full day of mixed use for most people, and the weight and footprint make it easy to carry around without a second thought.`,
    },
  ];

  return (
    <ProductDetail
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Laptops", href: "/laptops" },
        { label: laptop.brand, href: `/laptops?brand=${slugifyBrand(laptop.brand)}` },
        { label: laptop.name },
      ]}
      product={{
        slug: laptop.slug,
        category: "laptops",
        brand: laptop.brand,
        name: laptop.name,
        tagline: laptop.tagline,
        price: laptop.price,
        releaseYear: laptop.releaseYear,
        rating: laptop.rating,
        tags: laptop.tags,
        gradient: laptop.gradient,
        gallery: laptop.gallery,
        verdict: laptop.verdict,
        verdictIntro: `${laptop.verdict} It balances build quality, dependable performance, and battery life that feels capable for both everyday work and travel.`,
        verdictBody: `The ${laptop.name} is the kind of laptop that feels considered rather than excessive. It brings together solid hardware, a comfortable typing experience, and enough personality to stand out without unnecessary compromises.`,
        pros: laptop.pros,
        cons: laptop.cons,
        marketRates: laptop.marketRates,
        priceHistory: laptop.priceHistory,
      }}
      specRows={specRows}
      highlights={highlights}
    />
  );
}
