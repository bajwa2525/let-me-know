// Type-only module for the "accessories" category — data now comes from the
// database via lib/backend-data.ts.

export type AccessorySpec = {
  type: string;
  compatibility: string;
  capacity: string;
  connector: string;
  battery: string;
  weight: string;
};

export type Accessory = {
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
  specs: AccessorySpec;
  verdict: string;
  pros: string[];
  cons: string[];
};
