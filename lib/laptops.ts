// Type-only module for the "laptops" category — data now comes from the
// database via lib/backend-data.ts.

export type LaptopSpec = {
  display: string;
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
  battery: string;
  os: string;
  weight: string;
};

export type Laptop = {
  slug: string;
  brand: string;
  name: string;
  tagline: string;
  price: string;
  releaseYear: number;
  rating: number; // out of 10
  tags: string[];
  gradient: string;
  colorway: string[];
  image: string;
  imageAlt: string;
  gallery: { src: string; alt: string }[];
  specs: LaptopSpec;
  verdict: string;
  pros: string[];
  cons: string[];
};
