import Link from "next/link";
import Image from "next/image";
import PriceBox from "@/components/PriceBox";

type CardProduct = {
  slug: string;
  brand: string;
  name: string;
  tagline: string;
  price: string;
  releaseYear: number;
  rating: number;
  gradient: string;
  image: string;
  imageAlt: string;
};

export default function ProductCard({
  product,
  basePath,
}: {
  product: CardProduct;
  /** Route prefix for the detail page, e.g. "/phones" or "/laptops". */
  basePath: string;
}) {
  return (
    <Link
      href={`${basePath}/${product.slug}`}
      className="card-shine glass group relative block overflow-hidden rounded-2xl p-3 shadow-[0_8px_24px_-14px_rgba(0,0,0,0.4)] transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_32px_-14px_rgba(0,0,0,0.5)]"
    >
      <div
        className={`relative mb-3 flex h-24 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br sm:h-28 ${product.gradient}`}
      >
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 640px) 45vw, 220px"
          className="object-contain p-3 drop-shadow-lg transition-transform duration-500 ease-out group-hover:scale-110"
        />
      </div>
      <div className="mb-1 flex items-center justify-between text-[11px] text-muted">
        <span>{product.brand}</span>
        <span>★ {product.rating.toFixed(1)}</span>
      </div>
      <h3 className="mb-1 text-sm font-semibold leading-tight sm:text-base">{product.name}</h3>
      <p className="mb-2 line-clamp-2 text-[11px] text-muted sm:text-xs">{product.tagline}</p>
      <div className="flex items-center justify-between gap-2">
        <PriceBox price={product.price} size="sm" />
        <span className="shrink-0 text-[11px] text-muted">{product.releaseYear}</span>
      </div>
    </Link>
  );
}
