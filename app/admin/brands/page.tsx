"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError, type Brand } from "@/lib/api";
import Modal from "@/components/Modal";
import ImageUploadField from "@/components/ImageUploadField";

const EMPTY_FORM = { id: null as string | null, name: "", logo: "", gradient: "", colorway: "" };
const PAGE_SIZE = 8;

export default function AdminBrandsPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [fetching, setFetching] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

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
      const res = await api.listBrands({ search: search || undefined, page, pageSize: PAGE_SIZE });
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
    setForm(EMPTY_FORM);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(b: Brand) {
    setForm({
      id: b.id,
      name: b.name,
      logo: b.logo ?? "",
      gradient: b.gradient ?? "",
      colorway: b.colorway.join(", "),
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
        logo: form.logo || undefined,
        gradient: form.gradient || undefined,
        colorway: form.colorway
          ? form.colorway.split(",").map((c) => c.trim()).filter(Boolean)
          : [],
      };
      if (form.id) {
        await api.updateBrand(token, form.id, payload);
      } else {
        await api.createBrand(token, payload);
      }
      setModalOpen(false);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(b: Brand) {
    if (!token) return;
    if (!confirm(`Delete brand "${b.name}"?`)) return;
    try {
      await api.deleteBrand(token, b.id);
      if (rows.length === 1 && page > 1) setPage(page - 1);
      else await refresh();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-2xl font-semibold tracking-tight">Brands</h1>
          <p className="text-sm text-muted">Manage the brands products can belong to.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          + Add brand
        </button>
      </div>

      <div className="mb-4 relative max-w-sm">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">🔍</span>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search brands…"
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-sm outline-none focus:border-accent"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">Brand</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fetching && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-sm text-muted">
                    Loading…
                  </td>
                </tr>
              )}
              {!fetching &&
                rows.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-(--overlay)"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-8 w-8 shrink-0 rounded-full bg-gradient-to-br ${
                            b.gradient || "from-accent to-accent-2"
                          }`}
                        />
                        <span className="font-medium">{b.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted">{b.productCount ?? 0}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(b)}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:text-foreground"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(b)}
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
                  <td colSpan={3} className="px-4 py-10 text-center text-sm text-muted">
                    No brands found.
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={form.id ? "Edit brand" : "Add brand"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <ImageUploadField
            label="Logo (optional)"
            value={form.logo}
            onChange={(url) => setForm((f) => ({ ...f, logo: url }))}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted">Gradient class (e.g. from-slate-500 via-slate-300 to-amber-200)</label>
            <input
              value={form.gradient}
              onChange={(e) => setForm((f) => ({ ...f, gradient: e.target.value }))}
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted">Colorway (hex colors, comma separated)</label>
            <input
              value={form.colorway}
              onChange={(e) => setForm((f) => ({ ...f, colorway: e.target.value }))}
              placeholder="#8a8378, #1c1c1e"
              className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-3">
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
              {saving ? "Saving…" : form.id ? "Update brand" : "Create brand"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
