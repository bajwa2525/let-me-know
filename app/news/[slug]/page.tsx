import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getNewsAsync } from "@/lib/backend-data";
import Breadcrumbs from "@/components/Breadcrumbs";

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const news = await getNewsAsync();
  const article = news.find((a) => a.slug === slug);
  if (!article) notFound();

  const related = news.filter((a) => a.slug !== article.slug && a.category === article.category).slice(0, 3);

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "News", href: "/news" },
            { label: article.category, href: `/news?category=${encodeURIComponent(article.category)}` },
            { label: article.title },
          ]}
        />

        <div className="mb-3 flex items-center gap-2 text-xs text-muted">
          <span className="rounded-full bg-white/10 px-2 py-0.5">{article.category}</span>
          <span>
            {new Date(article.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span>· {article.author}</span>
        </div>

        <h1 className="mb-5 text-3xl font-bold leading-tight sm:text-4xl">{article.title}</h1>

        <div className="glass relative mb-8 h-56 w-full overflow-hidden rounded-[28px] sm:h-80">
          <Image src={article.image} alt={article.imageAlt} fill sizes="768px" className="object-cover" priority />
        </div>

        <div className="space-y-5 text-base leading-8 text-foreground/90">
          {article.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-lg font-semibold">More in {article.category}</h2>
            <div className="space-y-3">
              {related.map((a) => (
                <Link
                  key={a.slug}
                  href={`/news/${a.slug}`}
                  className="glass block rounded-2xl p-4 transition-colors hover:bg-(--overlay)"
                >
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
