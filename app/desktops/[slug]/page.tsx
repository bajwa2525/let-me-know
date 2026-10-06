import { notFound } from "next/navigation";
import { getDesktops } from "@/lib/backend-data";
import { slugifyBrand } from "@/lib/phones";
import ProductDetail, { type SpecRow } from "@/components/ProductDetail";

const SPEC_LABELS: Record<string, { label: string; icon: string }> = {
  formFactor: { label: "Form factor", icon: "🖥️" },
  cpu: { label: "CPU", icon: "⚙️" },
  gpu: { label: "GPU", icon: "🎮" },
  ram: { label: "RAM", icon: "🧠" },
  storage: { label: "Storage", icon: "💾" },
  os: { label: "OS", icon: "💻" },
  weight: { label: "Weight", icon: "⚖️" },
};

export default async function DesktopDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const desktops = await getDesktops();
  const desktop = desktops.find((d) => d.slug === slug);
  if (!desktop) notFound();

  const specRows: SpecRow[] = (Object.keys(SPEC_LABELS) as (keyof typeof desktop.specs)[]).map(
    (key) => ({
      label: SPEC_LABELS[key].label,
      value: desktop.specs[key],
      icon: SPEC_LABELS[key].icon,
    })
  );

  const highlights = [
    {
      title: "Design and build",
      body: `${desktop.brand} builds the ${desktop.name} around its footprint first — every internal layout choice serves the form factor it's aiming for, whether that's a shrunk-down mini PC or a serviceable tower.`,
    },
    {
      title: "Performance for the job",
      body: `It's tuned for the workloads its form factor implies rather than chasing benchmark records — smooth for everyday desktop use, with headroom that matches its era and price.`,
    },
    {
      title: "Living with it",
      body: `Setup is simple and it tends to fade into the background of a desk once it's running — exactly what a desktop should do.`,
    },
  ];

  return (
    <ProductDetail
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Desktops", href: "/desktops" },
        { label: desktop.brand, href: `/desktops?brand=${slugifyBrand(desktop.brand)}` },
        { label: desktop.name },
      ]}
      product={{
        slug: desktop.slug,
        category: "desktops",
        brand: desktop.brand,
        name: desktop.name,
        tagline: desktop.tagline,
        price: desktop.price,
        releaseYear: desktop.releaseYear,
        rating: desktop.rating,
        tags: desktop.tags,
        gradient: desktop.gradient,
        gallery: desktop.gallery,
        verdict: desktop.verdict,
        verdictIntro: `${desktop.verdict} It balances form factor, performance, and price in a way that's easy to recommend for the use case it targets.`,
        verdictBody: `The ${desktop.name} is the kind of desktop that feels considered rather than an afterthought. It does its job reliably without unnecessary compromises.`,
        pros: desktop.pros,
        cons: desktop.cons,
        marketRates: desktop.marketRates,
        priceHistory: desktop.priceHistory,
      }}
      specRows={specRows}
      highlights={highlights}
    />
  );
}
