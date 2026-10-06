import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import ThemeToggle from "@/components/ThemeToggle";
import NavDropdown from "@/components/NavDropdown";
import AuthNav from "@/components/AuthNav";
import MobileNav from "@/components/MobileNav";
import { CATEGORIES } from "@/lib/categories";
import { getAllProductsAsync } from "@/lib/backend-data";

const NAV_END = [
  { href: "/brands", label: "Brands" },
  { href: "/markets", label: "Markets" },
  { href: "/news", label: "News" },
  { href: "/reviews", label: "Reviews" },
  { href: "/about", label: "About Us" },
];

export default async function SiteHeader() {
  const categoryLinks = CATEGORIES.map((c) => ({
    href: c.basePath,
    label: c.label,
    emoji: c.emoji,
  }));

  // Search needs the full catalog; degrade to "no results" rather than
  // breaking the header (and therefore every page) if the backend is down.
  const products = await getAllProductsAsync().catch(() => []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="glass flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-gradient">
            LMK
          </span>
          <span>
            Let Me <span className="text-gradient">Know</span>
          </span>
        </Link>

        <div className="order-3 w-full sm:order-none sm:w-auto sm:flex-1 sm:px-8">
          <SearchBox products={products} />
        </div>

        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <NavDropdown label="Categories" items={categoryLinks} />
          {NAV_END.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>

        <MobileNav categoryLinks={categoryLinks} navEnd={NAV_END} />
        <AuthNav />
        <ThemeToggle />
      </div>
    </header>
  );
}
