import Link from "next/link";
import Image from "next/image";
import { getNewsAsync } from "@/lib/backend-data";
import Breadcrumbs from "@/components/Breadcrumbs";
import Reveal from "@/components/Reveal";

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const news = await getNewsAsync();
  const categories = ["All", ...Array.from(new Set(news.map((n) => n.category)))];
  const active = categories.includes(category ?? "") ? category! : "All";

  const articles = [...news]
    .filter((a) => active === "All" || a.category === active)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "News" }]} />
        <h1 className="mb-3 text-3xl font-bold sm:text-4xl">
          Latest <span className="text-gradient">news</span>
        </h1>
        <p className="mb-8 max-w-xl text-sm text-muted">
          Editorial coverage of the phones, laptops, gaming gear, and markets we track.
        </p>

        <div className="mb-10 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c}
              href={c === "All" ? "/news" : `/news?category=${encodeURIComponent(c)}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active === c
                  ? "border-transparent bg-white text-slate-900"
                  : "border-white/10 bg-white/5 text-muted hover:text-foreground"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        {articles.length === 0 && (
          <p className="text-sm text-muted">No articles in this category yet.</p>
        )}

        <div className="space-y-4">
          {articles.map((article, i) => (
            <Reveal key={article.slug} delayMs={i * 60}>
              <Link
                href={`/news/${article.slug}`}
                className="glass group flex gap-4 rounded-2xl p-4 transition-transform hover:-translate-y-1 sm:gap-5 sm:p-5"
              >
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-white/5 sm:h-28 sm:w-40">
                  <Image
                    src={article.image}
                    alt={article.imageAlt}
                    fill
                    sizes="160px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2 text-[11px] text-muted">
                    <span className="rounded-full bg-white/10 px-2 py-0.5">{article.category}</span>
                    <span>
                      {new Date(article.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h2 className="mb-1 line-clamp-2 font-semibold leading-snug">{article.title}</h2>
                  <p className="line-clamp-2 text-sm text-muted">{article.excerpt}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}
