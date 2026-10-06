import { NextRequest, NextResponse } from "next/server";
import {
  getPhones,
  getLaptops,
  getAccessories,
  getDesktops,
  getGamingDevices,
} from "@/lib/backend-data";
import { askGemini } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  let slug: string | undefined;
  let category: string | undefined;
  try {
    ({ slug, category } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let specLines: string[];
  let brand: string, name: string, releaseYear: number, price: string;
  const kind =
    category === "laptops"
      ? "laptop"
      : category === "accessories"
        ? "accessory"
        : category === "desktops"
          ? "desktop PC"
          : category === "gaming"
            ? "gaming device"
            : "phone";

  if (kind === "laptop") {
    const laptops = await getLaptops();
    const laptop = laptops.find((p) => p.slug === slug);
    if (!laptop) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    ({ brand, name, releaseYear, price } = laptop);
    specLines = [
      `Display: ${laptop.specs.display}`,
      `CPU: ${laptop.specs.cpu}`,
      `GPU: ${laptop.specs.gpu}`,
      `RAM: ${laptop.specs.ram}`,
      `Storage: ${laptop.specs.storage}`,
      `Battery: ${laptop.specs.battery}`,
      `OS: ${laptop.specs.os}`,
      `Weight: ${laptop.specs.weight}`,
    ];
  } else if (kind === "accessory") {
    const accessories = await getAccessories();
    const accessory = accessories.find((p) => p.slug === slug);
    if (!accessory) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    ({ brand, name, releaseYear, price } = accessory);
    specLines = [
      `Type: ${accessory.specs.type}`,
      `Compatibility: ${accessory.specs.compatibility}`,
      `Capacity: ${accessory.specs.capacity}`,
      `Connector: ${accessory.specs.connector}`,
      `Battery: ${accessory.specs.battery}`,
      `Weight: ${accessory.specs.weight}`,
    ];
  } else if (kind === "desktop PC") {
    const desktops = await getDesktops();
    const desktop = desktops.find((p) => p.slug === slug);
    if (!desktop) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    ({ brand, name, releaseYear, price } = desktop);
    specLines = [
      `Form factor: ${desktop.specs.formFactor}`,
      `CPU: ${desktop.specs.cpu}`,
      `GPU: ${desktop.specs.gpu}`,
      `RAM: ${desktop.specs.ram}`,
      `Storage: ${desktop.specs.storage}`,
      `OS: ${desktop.specs.os}`,
      `Weight: ${desktop.specs.weight}`,
    ];
  } else if (kind === "gaming device") {
    const gamingDevices = await getGamingDevices();
    const device = gamingDevices.find((p) => p.slug === slug);
    if (!device) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    ({ brand, name, releaseYear, price } = device);
    specLines = [
      `Type: ${device.specs.type}`,
      `Compatibility: ${device.specs.compatibility}`,
      `Capacity: ${device.specs.capacity}`,
      `Connector: ${device.specs.connector}`,
      `Battery: ${device.specs.battery}`,
      `Weight: ${device.specs.weight}`,
    ];
  } else {
    const phones = await getPhones();
    const phone = phones.find((p) => p.slug === slug);
    if (!phone) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    ({ brand, name, releaseYear, price } = phone);
    specLines = [
      `Display: ${phone.specs.display}`,
      `Chipset: ${phone.specs.chipset}`,
      `RAM: ${phone.specs.ram}`,
      `Storage: ${phone.specs.storage}`,
      `Battery: ${phone.specs.battery}`,
      `Camera: ${phone.specs.camera}`,
      `OS: ${phone.specs.os}`,
      `Weight: ${phone.specs.weight}`,
    ];
  }

  const prompt = `You are a careful ${kind}-spec fact-checker for a tech comparison website.
Here is the data we currently show for this real ${kind}:

Name: ${brand} ${name}
Released: ${releaseYear}
${specLines.join("\n")}
Launch price: ${price}

In 2-4 short sentences: confirm whether these specs look accurate for the real
device, point out anything that looks wrong or outdated, and add one
noteworthy real-world detail we're missing. Be concise, factual, and plain-text
(no markdown).`;

  try {
    const result = await askGemini(prompt);
    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
