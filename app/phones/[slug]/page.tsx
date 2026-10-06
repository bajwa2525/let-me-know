import { notFound } from "next/navigation";
import { getPhones } from "@/lib/backend-data";
import { slugifyBrand } from "@/lib/phones";
import ProductDetail, { type SpecRow } from "@/components/ProductDetail";

const SPEC_ICONS: Record<string, string> = {
  Display: "📱",
  Chipset: "⚙️",
  RAM: "🧠",
  Storage: "💾",
  Battery: "🔋",
  Camera: "📷",
  OS: "🤖",
  Weight: "⚖️",
};

export default async function PhoneDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const phones = await getPhones();
  const phone = phones.find((p) => p.slug === slug);
  if (!phone) notFound();

  const specRows: SpecRow[] = [
    ["Display", phone.specs.display],
    ["Chipset", phone.specs.chipset],
    ["RAM", phone.specs.ram],
    ["Storage", phone.specs.storage],
    ["Battery", phone.specs.battery],
    ["Camera", phone.specs.camera],
    ["OS", phone.specs.os],
    ["Weight", phone.specs.weight],
  ].map(([label, value]) => ({ label, value, icon: SPEC_ICONS[label] }));

  const highlights = [
    {
      title: "Design and build",
      body: `${phone.brand} continues to push the look and feel of the ${phone.name} toward a premium flagship identity. The design is polished, comfortable in hand, and consistent with the kind of hardware people genuinely want to carry every day.`,
    },
    {
      title: "Camera experience",
      body: `The camera system is one of the biggest reasons to consider this model. It blends everyday reliability with a strong low-light story, making it a device that works well for social content, travel shots, and quick family moments alike.`,
    },
    {
      title: "Daily performance",
      body: `Everyday tasks feel smooth, responsive, and efficient. App launches are fast, multitasking feels stable, and the phone delivers enough power to handle browsing, streaming, gaming, and productivity without friction.`,
    },
  ];

  return (
    <ProductDetail
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Phones", href: "/phones" },
        { label: phone.brand, href: `/brands/${slugifyBrand(phone.brand)}` },
        { label: phone.name },
      ]}
      product={{
        slug: phone.slug,
        category: "phones",
        brand: phone.brand,
        name: phone.name,
        tagline: phone.tagline,
        price: phone.price,
        releaseYear: phone.releaseYear,
        rating: phone.rating,
        tags: phone.tags,
        gradient: phone.gradient,
        gallery: phone.gallery,
        verdict: phone.verdict,
        verdictIntro: `${phone.verdict} It balances premium design, dependable performance, and a camera system that feels capable in both everyday shooting and more creative situations.`,
        verdictBody: `The ${phone.name} is the kind of device that feels considered rather than excessive. It brings together strong hardware, a polished software experience, and enough personality to stand out without creating unnecessary compromises.`,
        pros: phone.pros,
        cons: phone.cons,
        marketRates: phone.marketRates,
        priceHistory: phone.priceHistory,
      }}
      specRows={specRows}
      highlights={highlights}
    />
  );
}
