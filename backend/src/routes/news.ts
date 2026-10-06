import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { slugify } from "../lib/slugify";
import { requireAdmin, requireAuth } from "../middleware/auth";

const router = Router();

const newsSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  body: z.array(z.string()).min(1),
  image: z.string().url().optional().or(z.literal("")),
  imageAlt: z.string().optional(),
  category: z.string().min(1),
  author: z.string().min(1),
  date: z.string().optional(),
});

// GET /api/news?category=&search=&page=&pageSize=
router.get("/", async (req, res) => {
  const { category, search } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10));

  const where = {
    category: category && category !== "All" ? String(category) : undefined,
    title: search ? { contains: String(search), mode: "insensitive" as const } : undefined,
  };

  const [data, total] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.newsArticle.count({ where }),
  ]);

  res.json({ data, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
});

router.get("/:id", async (req, res) => {
  const article = await prisma.newsArticle.findUnique({ where: { id: req.params.id } });
  if (!article) return res.status(404).json({ error: "Article not found" });
  res.json(article);
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const parsed = newsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { slug, date, ...data } = parsed.data;

  let finalSlug = slugify(slug || data.title);
  if (await prisma.newsArticle.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${finalSlug}-${Date.now().toString(36)}`;
  }

  const article = await prisma.newsArticle.create({
    data: {
      ...data,
      slug: finalSlug,
      image: data.image || undefined,
      date: date ? new Date(date) : undefined,
    },
  });
  res.status(201).json(article);
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const parsed = newsSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { slug, date, ...data } = parsed.data;

  const exists = await prisma.newsArticle.findUnique({ where: { id: req.params.id } });
  if (!exists) return res.status(404).json({ error: "Article not found" });

  const article = await prisma.newsArticle.update({
    where: { id: req.params.id },
    data: {
      ...data,
      slug: slug ? slugify(slug) : undefined,
      image: data.image === "" ? null : data.image,
      date: date ? new Date(date) : undefined,
    },
  });
  res.json(article);
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const exists = await prisma.newsArticle.findUnique({ where: { id: req.params.id } });
  if (!exists) return res.status(404).json({ error: "Article not found" });

  await prisma.newsArticle.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
