// Thin client for the Express + JWT backend in /backend. The admin panel
// (/admin/*) manages brands, products, and news through this client; the
// public catalog pages still read static lib/*.ts data for now.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type Role = "ADMIN" | "USER";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type ProductType = "PHONE" | "LAPTOP" | "DESKTOP" | "GAMING" | "ACCESSORY";

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  gradient?: string | null;
  colorway: string[];
  productCount?: number;
};

export type BrandPage = {
  data: Brand[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ProductImage = {
  id?: string;
  src: string;
  alt?: string;
  sortOrder?: number;
};

export type MarketPrice = {
  id?: string;
  market: string;
  city: string;
  price: number;
  stock?: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  productType: ProductType;
  brandId: string;
  brand: Brand;
  priceUsd: number;
  releaseYear?: number | null;
  rating: number;
  tags: string[];
  gradient?: string | null;
  colorway: string[];
  image?: string | null;
  imageAlt?: string | null;
  verdict?: string | null;
  pros: string[];
  cons: string[];
  specs?: Record<string, unknown> | null;
  isHot: boolean;
  isFeatured: boolean;
  dateAdded: string;
  dateUpdated: string;
  gallery: ProductImage[];
  marketPrices: MarketPrice[];
  priceHistory: { id: string; avgPrice: number; recordedAt: string }[];
};

export type ProductPage = {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ProductStats = {
  total: number;
  hot: number;
  featured: number;
  byType: Partial<Record<ProductType, number>>;
};

export type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  image?: string | null;
  imageAlt?: string | null;
  category: string;
  author: string;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type NewsPage = {
  data: NewsArticle[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : undefined;

  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "error" in body
        ? typeof body.error === "string"
          ? body.error
          : JSON.stringify(body.error)
        : undefined) || `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }

  return body as T;
}

function qs(params: Record<string, string | number | boolean | undefined>) {
  const usable = Object.entries(params).filter(([, v]) => v !== undefined && v !== "");
  const s = new URLSearchParams(usable as [string, string][]).toString();
  return s ? `?${s}` : "";
}

export const api = {
  register: (data: { name: string; email: string; password: string }) =>
    request<{ token: string; user: AuthUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: (token: string) => request<AuthUser>("/api/auth/me", { token }),

  // Brands
  listBrands: (params?: { search?: string; page?: number; pageSize?: number }) =>
    request<BrandPage>(`/api/brands${qs(params ?? {})}`),
  listAllBrands: () => request<Brand[]>("/api/brands/all"),
  createBrand: (token: string, data: Partial<Brand> & { name: string }) =>
    request<Brand>("/api/brands", { method: "POST", token, body: JSON.stringify(data) }),
  updateBrand: (token: string, id: string, data: Partial<Brand>) =>
    request<Brand>(`/api/brands/${id}`, { method: "PUT", token, body: JSON.stringify(data) }),
  deleteBrand: (token: string, id: string) =>
    request<void>(`/api/brands/${id}`, { method: "DELETE", token }),

  // Products
  listProducts: (params?: {
    type?: string;
    brand?: string;
    search?: string;
    hot?: boolean;
    featured?: boolean;
    page?: number;
    pageSize?: number;
  }) => request<ProductPage>(`/api/products${qs(params ?? {})}`),

  getStats: () => request<ProductStats>("/api/products/meta/stats"),

  getProduct: (id: string) => request<Product>(`/api/products/${id}`),

  createProduct: (
    token: string,
    data: Partial<Product> & { name: string; brandId: string; productType: ProductType; priceUsd: number }
  ) =>
    request<Product>("/api/products", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),

  updateProduct: (token: string, id: string, data: Partial<Product>) =>
    request<Product>(`/api/products/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(data),
    }),

  deleteProduct: (token: string, id: string) =>
    request<void>(`/api/products/${id}`, { method: "DELETE", token }),

  // News
  listNews: (params?: { category?: string; search?: string; page?: number; pageSize?: number }) =>
    request<NewsPage>(`/api/news${qs(params ?? {})}`),

  getNewsArticle: (id: string) => request<NewsArticle>(`/api/news/${id}`),

  createNews: (
    token: string,
    data: Partial<NewsArticle> & { title: string; excerpt: string; body: string[]; category: string; author: string }
  ) => request<NewsArticle>("/api/news", { method: "POST", token, body: JSON.stringify(data) }),

  updateNews: (token: string, id: string, data: Partial<NewsArticle>) =>
    request<NewsArticle>(`/api/news/${id}`, { method: "PUT", token, body: JSON.stringify(data) }),

  deleteNews: (token: string, id: string) =>
    request<void>(`/api/news/${id}`, { method: "DELETE", token }),

  // Uploads
  uploadImage: async (token: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_URL}/api/uploads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const body = await res.json().catch(() => undefined);
    if (!res.ok) {
      throw new ApiError(res.status, (body && body.error) || `Upload failed with status ${res.status}`);
    }
    return body as { url: string };
  },
};
