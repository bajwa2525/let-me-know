"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Tooltip from "@/components/Tooltip";

type GalleryImage = { src: string; alt: string };

export default function PhoneGallery({
  images,
  layout = "grid",
  gradient,
}: {
  images: GalleryImage[];
  /** "hero" renders one large clickable photo (for the top banner);
   *  "grid" renders a thumbnail grid — both open the same full-view lightbox. */
  layout?: "grid" | "hero";
  /** Background shown behind the hero photo while it loads. */
  gradient?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = () => setOpenIndex(null);
  const showPrev = () =>
    setOpenIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
  const showNext = () => setOpenIndex((i) => (i === null ? i : (i + 1) % images.length));

  useEffect(() => {
    if (openIndex === null) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex]);

  return (
    <>
      {layout === "hero" ? (
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          aria-label={`View full image: ${images[0].alt}`}
          className={`group relative flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${gradient ?? ""} sm:h-full`}
        >
          <Image
            src={images[0].src}
            alt={images[0].alt}
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            className="object-contain p-8 drop-shadow-xl"
            priority
            unoptimized
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-2xl text-transparent transition-colors group-hover:bg-black/20 group-hover:text-white">
            🔍
          </span>
          {images.length > 1 && (
            <span className="absolute bottom-3 right-3 rounded-full bg-black/40 px-2 py-1 text-[10px] font-medium text-white">
              +{images.length - 1} more
            </span>
          )}
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={`View full image: ${img.alt}`}
              className="glass group relative h-28 overflow-hidden rounded-xl sm:h-36"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 33vw, 200px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                unoptimized
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-transparent transition-colors group-hover:bg-black/30 group-hover:text-white">
                🔍
              </span>
            </button>
          ))}
        </div>
      )}

      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          onClick={close}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          <Tooltip label="Close" side="left">
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20"
            >
              ✕
            </button>
          </Tooltip>

          {images.length > 1 && (
            <>
              <Tooltip label="Previous image" side="right">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showPrev();
                  }}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20 sm:left-4"
                >
                  ←
                </button>
              </Tooltip>
              <Tooltip label="Next image" side="left">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showNext();
                  }}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20 sm:right-4"
                >
                  →
                </button>
              </Tooltip>
            </>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative h-[80vh] w-full max-w-3xl"
          >
            <Image
              src={images[openIndex].src}
              alt={images[openIndex].alt}
              fill
              sizes="100vw"
              className="object-contain"
              priority
              unoptimized
            />
          </div>

          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs text-white">
            {openIndex + 1} / {images.length} · {images[openIndex].alt}
          </p>
        </div>
      )}
    </>
  );
}
