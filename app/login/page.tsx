"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      router.push(user.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-[80vh] items-center justify-center px-6 py-16">
      <div
        className={`auth-card glass relative w-full max-w-md rounded-2xl p-8 ${
          shake ? "animate-[authShake_500ms_ease-in-out]" : ""
        }`}
      >
        <div
          className="auth-field mb-2 flex items-center gap-2"
          style={{ "--auth-field-delay": "0ms" } as React.CSSProperties}
        >
          <span className="glass flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-gradient">
            LMK
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
        </div>
        <p
          className="auth-field mb-8 text-sm text-muted"
          style={{ "--auth-field-delay": "60ms" } as React.CSSProperties}
        >
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Register
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div
            className="auth-field flex flex-col gap-1.5"
            style={{ "--auth-field-delay": "120ms" } as React.CSSProperties}
          >
            <label htmlFor="email" className="text-sm text-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-[border-color,box-shadow] duration-200 focus:border-accent focus:shadow-[0_0_0_3px_var(--overlay)]"
              placeholder="you@example.com"
            />
          </div>

          <div
            className="auth-field flex flex-col gap-1.5"
            style={{ "--auth-field-delay": "180ms" } as React.CSSProperties}
          >
            <label htmlFor="password" className="text-sm text-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-[border-color,box-shadow] duration-200 focus:border-accent focus:shadow-[0_0_0_3px_var(--overlay)]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 animate-[authFieldIn_300ms_ease-out]">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="auth-field group relative mt-2 overflow-hidden rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ "--auth-field-delay": "240ms" } as React.CSSProperties}
          >
            <span className="relative z-10">{submitting ? "Logging in…" : "Log in"}</span>
            <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-0" />
          </button>
        </form>
      </div>
    </main>
  );
}
