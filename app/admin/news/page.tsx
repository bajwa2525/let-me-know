"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError, type NewsArticle } from "@/lib/api";
import Modal from "@/components/Modal";
import ImageUploadField from "@/components/ImageUploadField";

const PAGE_SIZE = 8;

const CATEGORIES = ["Phones", "Laptops", "Desktops", "Gaming", "Accessories", "Markets"];

const EMPTY_FORM = {
  id: null as string | null,
  title: "",
  excerpt: "",
  body: "",
  image: "",
  imageAlt: "",
  category: CATEGORIES[0],
  author: "Let Me Know Editorial",
  date: new Date().toISOString().slice(0, 10),
};

export default function AdminNewsPage() {
  const { token } = useAuth();

  const [rows, setRows] = useState<NewsArticle[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [fetching, setFetching] = useState(true);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  async function refresh() {
    setFetching(true);
    try {
      const res = await api.listNews({ search: search || undefined, page, pageSize: PAGE_SIZE });
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
  }, [search, page]);

  function openCreate() {
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) });
    setError(null);
    setModalOpen(true);
  }

  function openEdit(n: NewsArticle) {
    setForm({
      id: n.id,
      title: n.title,
      excerpt: n.excerpt,
      body: n.body.join("\n\n"),
      image: n.image ?? "",
      imageAlt: n.imageAlt ?? "",
      category: n.category,
      author: n.author,
      date: n.date.slice(0, 10),
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
        title: form.title,
        excerpt: form.excerpt,
        body: form.body
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean),
        image: form.image || undefined,
        imageAlt: form.imageAlt || undefined,
        category: form.category,
        author: form.author,
        date: form.date,
      };
      if (form.id) {
        await api.updateNews(token, form.id, payload);
      } else {
        await api.createNews(token, payload);
      }
      setModalOpen(false);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(n: NewsArticle) {
    if (!token) return;
    if (!confirm(`Delete "${n.title}"?`)) return;
    await api.deleteNews(token, n.id);
    if (rows.length === 1 && page > 1) setPage(page - 1);
    else await refresh();
  }

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-2xl font-semibold tracking-tight">News</h1>
          <p className="text-sm text-muted">Write and publish editorial articles.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          + Add article
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">🔍</span>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search articles…"
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fetching && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted">
                    Loading…
                  </td>
                </tr>
              )}
              {!fetching &&
                rows.map((n) => (
                  <tr
                    key={n.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-(--overlay)"
                  >
                    <td className="max-w-xs px-4 py-3.5">
                      <p className="truncate font-medium">{n.title}</p>
                      <p className="truncate text-xs text-muted">{n.excerpt}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">
                        {n.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted">{n.author}</td>
                    <td className="px-4 py-3.5 text-muted">{new Date(n.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(n)}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:text-foreground"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(n)}
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
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted">
                    No articles yet.
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
          <span className="px-2">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-border px-3 py-1.5 transition-colors hover:text-foreground disabled:opacity-40 disabled:hover:text-muted"
          >
            Next
          </button>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={form.id ? "Edit article" : "Add article"}>
        <form onSubmit={handleSubmit} className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted">Title</label>
            <input
              required
              autoFocus
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted">Excerpt</label>
            <textarea
              required
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              rows={2}
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted">Body — separate paragraphs with a blank line</label>
            <textarea
              required
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={6}
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted">Author</label>
              <input
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-muted">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <ImageUploadField
              label="Image"
              value={form.image}
              onChange={(url) => setForm((f) => ({ ...f, image: url }))}
            />
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
              {saving ? "Saving…" : form.id ? "Update article" : "Publish article"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
