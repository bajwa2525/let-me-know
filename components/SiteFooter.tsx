import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} Let Me Know. Built for people who just want to
          know which device to buy.
        </p>
        <div className="flex flex-wrap gap-5">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <Link href="/brands" className="hover:text-foreground">
            Brands
          </Link>
          <Link href="/markets" className="hover:text-foreground">
            Markets
          </Link>
          <Link href="/news" className="hover:text-foreground">
            News
          </Link>
          <Link href="/reviews" className="hover:text-foreground">
            Reviews
          </Link>
          <Link href="/about" className="hover:text-foreground">
            About Us
          </Link>
        </div>
      </div>
    </footer>
  );
}
