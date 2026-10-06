import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { slugify } from "../lib/slugify";
import { requireAdmin, requireAuth } from "../middleware/auth";

const router = Router();

const brandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  logo: z.string().url().optional().or(z.literal("")),
  gradient: z.string().optional(),
  colorway: z.array(z.string()).optional(),
});

function toDto(b: {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  gradient: string | null;
  colorway: string[];
  _count: { products: number };
}) {
  return {
    id: b.id,
    name: b.name,
    slug: b.slug,
    logo: b.logo,
    gradient: b.gradient,
    colorway: b.colorway,
    productCount: b._count.products,
  };
}

// GET /api/brands?search=&page=&pageSize= — paginated, for the admin table.
router.get("/", async (req, res) => {
  const { search } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 8));

  const where = search ? { name: { contains: String(search), mode: "insensitive" as const } } : {};

  const [rows, total] = await Promise.all([
    prisma.brand.findMany({
      where,
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.brand.count({ where }),
  ]);

  res.json({
    data: rows.map(toDto),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
});

// GET /api/brands/all — every brand, unpaginated, for dropdowns/selects.
router.get("/all", async (_req, res) => {
  const brands = await prisma.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  res.json(brands.map(toDto));
});

router.get("/:id", async (req, res) => {
  const brand = await prisma.brand.findUnique({ where: { id: req.params.id } });
  if (!brand) return res.status(404).json({ error: "Brand not found" });
  res.json(brand);
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const parsed = brandSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, slug, logo, gradient, colorway } = parsed.data;

  const finalSlug = slugify(slug || name);
  const existing = await prisma.brand.findFirst({
    where: { OR: [{ name }, { slug: finalSlug }] },
  });
  if (existing) return res.status(409).json({ error: "A brand with this name already exists" });

  const brand = await prisma.brand.create({
    data: { name, slug: finalSlug, logo: logo || undefined, gradient, colorway: colorway ?? [] },
  });
  res.status(201).json(brand);
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const parsed = brandSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const exists = await prisma.brand.findUnique({ where: { id: req.params.id } });
  if (!exists) return res.status(404).json({ error: "Brand not found" });

  const { name, slug, logo, gradient, colorway } = parsed.data;
  const brand = await prisma.brand.update({
    where: { id: req.params.id },
    data: {
      name,
      slug: slug ? slugify(slug) : undefined,
      logo: logo === "" ? null : logo,
      gradient,
      colorway,
    },
  });
  res.json(brand);
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const exists = await prisma.brand.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { products: true } } },
  });
  if (!exists) return res.status(404).json({ error: "Brand not found" });
  if (exists._count.products > 0) {
    return res
      .status(409)
      .json({ error: `Cannot delete — ${exists._count.products} product(s) still use this brand` });
  }

  await prisma.brand.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
