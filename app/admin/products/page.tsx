"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError, type Brand, type Product, type ProductType } from "@/lib/api";
import Modal from "@/components/Modal";
import ImageUploadField from "@/components/ImageUploadField";
import {
  galleryToText,
  marketPricesToText,
  specsToText,
  tagsToText,
  textToGallery,
  textToMarketPrices,
  textToSpecs,
  textToTags,
} from "@/lib/admin-format";

const PRODUCT_TYPES: ProductType[] = ["PHONE", "LAPTOP", "DESKTOP", "GAMING", "ACCESSORY"];

const TYPE_BADGE: Record<ProductType, string> = {
  PHONE: "bg-accent/15 text-accent",
  LAPTOP: "bg-accent-2/15 text-accent-2",
  DESKTOP: "bg-accent-3/15 text-accent-3",
  GAMING: "bg-emerald-400/15 text-emerald-400",
  ACCESSORY: "bg-amber-400/15 text-amber-400",
};

const PAGE_SIZE = 8;

const EMPTY_FORM = {
  id: null as string | null,
  name: "",
  tagline: "",
  brandId: "",
  productType: "PHONE" as ProductType,
  priceUsd: "",
  releaseYear: "",
  rating: "",
  tags: "",
  image: "",
  imageAlt: "",
  verdict: "",
  pros: "",
  cons: "",
  specs: "",
  gallery: "",
  marketPrices: "",
  isHot: false,
  isFeatured: false,
};

export default function AdminProductsPage() {
  const { token } = useAuth();

  const [rows, setRows] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [fetching, setFetching] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProductType | "">("");
  const [brandFilter, setBrandFilter] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  async function handleGalleryUpload(file: File | undefined) {
    if (!file || !token) return;
    setGalleryUploading(true);
    try {
      const { url } = await api.uploadImage(token, file);
      setForm((f) => ({ ...f, gallery: f.gallery ? `${f.gallery}\n${url}` : url }));
    } catch {
      // surfaced via the main form error banner on next save if it matters
    } finally {
      setGalleryUploading(false);
      if (galleryFileRef.current) galleryFileRef.current.value = "";
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    api.listAllBrands().then(setBrands).catch(() => {});
  }, []);

  async function refresh() {
    setFetching(true);
    try {
      const res = await api.listProducts({
        search: search || undefined,
        type: typeFilter || undefined,
        brand: brandFilter || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setRows(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, typeFilter, brandFilter, page]);

  function openCreate() {
    setForm({ ...EMPTY_FORM, brandId: brands[0]?.id ?? "" });
    setError(null);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setForm({
      id: p.id,
      name: p.name,
      tagline: p.tagline ?? "",
      brandId: p.brandId,
      productType: p.productType,
      priceUsd: String(p.priceUsd),
      releaseYear: p.releaseYear ? String(p.releaseYear) : "",
      rating: String(p.rating ?? ""),
      tags: tagsToText(p.tags),
      image: p.image ?? "",
      imageAlt: p.imageAlt ?? "",
      verdict: p.verdict ?? "",
      pros: p.pros.join("\n"),
      cons: p.cons.join("\n"),
      specs: specsToText(p.specs),
      gallery: galleryToText(p.gallery),
      marketPrices: marketPricesToText(p.marketPrices),
      isHot: p.isHot,
      isFeatured: p.isFeatured,
    });
    setError(null);
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        tagline: form.tagline || undefined,
        brandId: form.brandId,
        productType: form.productType,
        priceUsd: Number(form.priceUsd) || 0,
        releaseYear: form.releaseYear ? Number(form.releaseYear) : undefined,
        rating: form.rating ? Number(form.rating) : undefined,
        tags: textToTags(form.tags),
        image: form.image || undefined,
        imageAlt: form.imageAlt || undefined,
        verdict: form.verdict || undefined,
        pros: form.pros ? form.pros.split("\n").map((s) => s.trim()).filter(Boolean) : [],
        cons: form.cons ? form.cons.split("\n").map((s) => s.trim()).filter(Boolean) : [],
        specs: textToSpecs(form.specs),
        gallery: textToGallery(form.gallery),
        marketPrices: textToMarketPrices(form.marketPrices),
        isHot: form.isHot,
        isFeatured: form.isFeatured,
      };
      if (form.id) {
        await api.updateProduct(token, form.id, payload);
      } else {
        await api.createProduct(token, payload);
      }
      setModalOpen(false);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: Product) {
    if (!token) return;
    if (!confirm(`Delete "${p.brand.name} ${p.name}"?`)) return;
    await api.deleteProduct(token, p.id);
    if (rows.length === 1 && page > 1) setPage(page - 1);
    else await refresh();
  }

  const hasFilters = !!(search || typeFilter || brandFilter);
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted">Create, edit, and remove catalog products.</p>
        </div>
        <button
          onClick={openCreate}
          disabled={brands.length === 0}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          + Add product
        </button>
      </div>

      {brands.length === 0 && (
        <p className="mb-4 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
          Add a brand first (Brands tab) before creating products.
        </p>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-55 flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            🔍
          </span>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name…"
            className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as ProductType | "");
            setPage(1);
          }}
          className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
        >
          <option value="">All types</option>
          {PRODUCT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={brandFilter}
          onChange={(e) => {
            setBrandFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
        >
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setTypeFilter("");
              setBrandFilter("");
              setPage(1);
            }}
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Flags</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fetching &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-3.5" colSpan={6}>
                      <div className="h-4 w-full max-w-sm animate-pulse rounded bg-(--overlay)" />
                    </td>
                  </tr>
                ))}

              {!fetching &&
                rows.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-(--overlay)"
                  >
                    <td className="px-4 py-3.5">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted">{p.brand.name}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${TYPE_BADGE[p.productType]}`}
                      >
                        {p.productType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted">${p.priceUsd}</td>
                    <td className="px-4 py-3.5 text-muted">{p.rating ? p.rating.toFixed(1) : "—"}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1.5">
                        {p.isHot && (
                          <span className="rounded-full bg-rose-400/15 px-2 py-0.5 text-xs text-rose-400">
                            🔥 Hot
                          </span>
                        )}
                        {p.isFeatured && (
                          <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs text-amber-400">
                            ⭐ Top
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:text-foreground"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-400/10"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!fetching && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">
                    {hasFilters ? "No products match these filters." : "No products yet — add one above."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <p>{total === 0 ? "0 results" : `Showing ${from}–${to} of ${total}`}</p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-border px-3 py-1.5 transition-colors hover:text-foreground disabled:opacity-40 disabled:hover:text-muted"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
            .reduce<number[]>((acc, n) => {
              if (acc.length && n - acc[acc.length - 1] > 1) acc.push(-1);
              acc.push(n);
              return acc;
            }, [])
            .map((n, i) =>
              n === -1 ? (
                <span key={`gap-${i}`} className="px-1" />
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-8 w-8 rounded-lg text-xs transition-colors ${
                    n === page ? "bg-accent text-white" : "border border-border hover:text-foreground"
                  }`}
                >
                  {n}
                </button>
              )
            )}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-border px-3 py-1.5 transition-colors hover:text-foreground disabled:opacity-40 disabled:hover:text-muted"
          >
            Next
          </button>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? "Edit product" : "Add product"}
      >
        <form onSubmit={handleSubmit} className="flex max-h-[75vh] flex-col gap-5 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted">Name</label>
              <input
                required
                autoFocus
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted">Brand</label>
              <select
                required
                value={form.brandId}
                onChange={(e) => setForm((f) => ({ ...f, brandId: e.target.value }))}
                className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted">Type</label>
              <select
                value={form.productType}
                onChange={(e) => setForm((f) => ({ ...f, productType: e.target.value as ProductType }))}
                className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              >
                {PRODUCT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted">Tagline</label>
              <input
                value={form.tagline}
                onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted">Price (USD)</label>
              <input
                required
                type="number"
                step="0.01"
                value={form.priceUsd}
                onChange={(e) => setForm((f) => ({ ...f, priceUsd: e.target.value }))}
                className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted">Release year</label>
              <input
                type="number"
                value={form.releaseYear}
                onChange={(e) => setForm((f) => ({ ...f, releaseYear: e.target.value }))}
                className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted">Rating (0–10)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={form.rating}
                onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted">Tags (comma separated)</label>
              <input
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="Flagship, 5G, Titanium"
                className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>

            <ImageUploadField
              label="Main image"
              value={form.image}
              onChange={(url) => setForm((f) => ({ ...f, image: url }))}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted">Image alt text</label>
              <input
                value={form.imageAlt}
                onChange={(e) => setForm((f) => ({ ...f, imageAlt: e.target.value }))}
                className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted">Verdict</label>
            <textarea
              value={form.verdict}
              onChange={(e) => setForm((f) => ({ ...f, verdict: e.target.value }))}
              rows={2}
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted">Pros (one per line)</label>
              <textarea
                value={form.pros}
                onChange={(e) => setForm((f) => ({ ...f, pros: e.target.value }))}
                rows={3}
                className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted">Cons (one per line)</label>
              <textarea
                value={form.cons}
                onChange={(e) => setForm((f) => ({ ...f, cons: e.target.value }))}
                rows={3}
                className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted">Specs — one per line, "key: value"</label>
            <textarea
              value={form.specs}
              onChange={(e) => setForm((f) => ({ ...f, specs: e.target.value }))}
              rows={4}
              placeholder={"display: 6.3in OLED\nchipset: A18 Pro\nram: 8GB"}
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-xs outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted">
                Gallery — one image URL per line (optionally &quot;url | alt text&quot;)
              </label>
              <button
                type="button"
                onClick={() => galleryFileRef.current?.click()}
                disabled={galleryUploading}
                className="text-xs text-accent transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                {galleryUploading ? "Uploading…" : "+ Upload image"}
              </button>
              <input
                ref={galleryFileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                hidden
                onChange={(e) => handleGalleryUpload(e.target.files?.[0])}
              />
            </div>
            <textarea
              value={form.gallery}
              onChange={(e) => setForm((f) => ({ ...f, gallery: e.target.value }))}
              rows={3}
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-xs outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted">
              Market prices — one per line, &quot;market, city, price (PKR), stock&quot;
            </label>
            <textarea
              value={form.marketPrices}
              onChange={(e) => setForm((f) => ({ ...f, marketPrices: e.target.value }))}
              rows={3}
              placeholder={"Hafeez Center, Lahore, 395000, 10\nRainbow Centre, Karachi, 389000, 6"}
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-xs outline-none focus:border-accent"
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={form.isHot}
                onChange={(e) => setForm((f) => ({ ...f, isHot: e.target.checked }))}
                className="h-4 w-4 accent-accent"
              />
              🔥 Mark as hot product
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                className="h-4 w-4 accent-accent"
              />
              ⭐ Mark as top product
            </label>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-border px-5 py-2.5 text-sm text-muted hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : form.id ? "Update product" : "Create product"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
