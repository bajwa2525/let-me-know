import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { slugify } from "../lib/slugify";
import { requireAdmin, requireAuth } from "../middleware/auth";

const router = Router();

const productTypes = ["PHONE", "LAPTOP", "DESKTOP", "GAMING", "ACCESSORY"] as const;

const galleryItemSchema = z.object({
  src: z.string().url(),
  alt: z.string().optional(),
  sortOrder: z.number().optional(),
});

const marketPriceSchema = z.object({
  market: z.string().min(1),
  city: z.string().min(1),
  price: z.number(),
  stock: z.number().optional(),
});

const productSchema = z.object({
  slug: z.string().min(1).optional(),
  name: z.string().min(1),
  tagline: z.string().optional(),
  productType: z.enum(productTypes),
  brandId: z.string().min(1),
  priceUsd: z.number(),
  releaseYear: z.number().optional(),
  rating: z.number().min(0).max(10).optional(),
  tags: z.array(z.string()).optional(),
  gradient: z.string().optional(),
  colorway: z.array(z.string()).optional(),
  image: z.string().url().optional().or(z.literal("")),
  imageAlt: z.string().optional(),
  verdict: z.string().optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  specs: z.record(z.string(), z.any()).optional(),
  isHot: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  gallery: z.array(galleryItemSchema).optional(),
  marketPrices: z.array(marketPriceSchema).optional(),
});

const include = {
  brand: true,
  gallery: { orderBy: { sortOrder: "asc" as const } },
  marketPrices: true,
  priceHistory: { orderBy: { recordedAt: "asc" as const } },
};

/** Records a price-history point from the average of a set of market
 *  prices — called whenever an admin sets/updates a product's prices, so
 *  the trend chart is built from real snapshots over time instead of a
 *  simulation. No-ops when there's nothing to average. */
async function recordPriceSnapshot(productId: string, marketPrices: { price: number }[]) {
  if (marketPrices.length === 0) return;
  const avgPrice = marketPrices.reduce((sum, m) => sum + m.price, 0) / marketPrices.length;
  await prisma.priceSnapshot.create({ data: { productId, avgPrice } });
}

// GET /api/products?type=&brand=&search=&hot=&featured=&page=&pageSize=
router.get("/", async (req, res) => {
  const { type, brand, search, hot, featured } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10));

  const where = {
    productType: type ? (type as any) : undefined,
    brand: brand ? { name: { contains: String(brand), mode: "insensitive" as const } } : undefined,
    name: search ? { contains: String(search), mode: "insensitive" as const } : undefined,
    isHot: hot === "true" ? true : undefined,
    isFeatured: featured === "true" ? true : undefined,
  };

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include,
      orderBy: { dateAdded: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ data, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
});

router.get("/meta/stats", async (_req, res) => {
  const [total, byType, hot, featured] = await Promise.all([
    prisma.product.count(),
    prisma.product.groupBy({ by: ["productType"], _count: { _all: true } }),
    prisma.product.count({ where: { isHot: true } }),
    prisma.product.count({ where: { isFeatured: true } }),
  ]);
  res.json({
    total,
    hot,
    featured,
    byType: Object.fromEntries(byType.map((t) => [t.productType, t._count._all])),
  });
});

router.get("/:id", async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id }, include });
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { gallery, marketPrices, slug, ...data } = parsed.data;

  const brand = await prisma.brand.findUnique({ where: { id: data.brandId } });
  if (!brand) return res.status(400).json({ error: "Unknown brandId" });

  let finalSlug = slugify(slug || `${brand.name}-${data.name}`);
  if (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${finalSlug}-${Date.now().toString(36)}`;
  }

  const product = await prisma.product.create({
    data: {
      ...data,
      slug: finalSlug,
      image: data.image || undefined,
      tags: data.tags ?? [],
      colorway: data.colorway ?? [],
      pros: data.pros ?? [],
      cons: data.cons ?? [],
      gallery: gallery ? { create: gallery } : undefined,
      marketPrices: marketPrices ? { create: marketPrices } : undefined,
    },
    include,
  });

  if (marketPrices) {
    await recordPriceSnapshot(product.id, marketPrices);
    product.priceHistory = await prisma.priceSnapshot.findMany({
      where: { productId: product.id },
      orderBy: { recordedAt: "asc" },
    });
  }

  res.status(201).json(product);
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { gallery, marketPrices, slug, ...data } = parsed.data;

  const exists = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!exists) return res.status(404).json({ error: "Product not found" });

  if (data.brandId) {
    const brand = await prisma.brand.findUnique({ where: { id: data.brandId } });
    if (!brand) return res.status(400).json({ error: "Unknown brandId" });
  }

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      ...data,
      slug: slug ? slugify(slug) : undefined,
      image: data.image === "" ? null : data.image,
      ...(gallery ? { gallery: { deleteMany: {}, create: gallery } } : {}),
      ...(marketPrices ? { marketPrices: { deleteMany: {}, create: marketPrices } } : {}),
    },
    include,
  });

  if (marketPrices) {
    await recordPriceSnapshot(product.id, marketPrices);
    product.priceHistory = await prisma.priceSnapshot.findMany({
      where: { productId: product.id },
      orderBy: { recordedAt: "asc" },
    });
  }

  res.json(product);
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const exists = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!exists) return res.status(404).json({ error: "Product not found" });

  await prisma.product.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
