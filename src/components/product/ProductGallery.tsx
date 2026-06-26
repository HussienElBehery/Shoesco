"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { trackEvent } from "@/lib/analytics";
import type { Product } from "@/types/product";

export function ProductGallery({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const images = product.images;
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const touchStart = useRef<number | null>(null);

  function show(index: number) {
    if (!images.length) return;
    const next = (index + images.length) % images.length;
    setActiveIndex(next);
    trackEvent("gallery_interaction", {
      productId: product.id,
      image: next,
    });
  }

  if (!images.length) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-[1.75rem] border border-[#2a2e36] bg-[#181b21] text-sm text-neutral-500">
        Product photography coming soon
      </div>
    );
  }

  const image = images[activeIndex];

  return (
    <div
      className="grid gap-3"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") show(activeIndex - 1);
        if (event.key === "ArrowRight") show(activeIndex + 1);
        if (event.key === "Escape") setZoomed(false);
      }}
    >
      <div
        className={`relative overflow-hidden rounded-[1.75rem] border border-[#2a2e36] bg-[#f2efe7] ${compact ? "aspect-[4/3]" : "aspect-square"}`}
        onTouchEnd={(event) => {
          if (touchStart.current === null) return;
          const delta = event.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(delta) > 40) show(activeIndex + (delta < 0 ? 1 : -1));
          touchStart.current = null;
        }}
        onTouchStart={(event) => {
          touchStart.current = event.touches[0].clientX;
        }}
        tabIndex={0}
      >
        <button
          aria-label={zoomed ? "Reset product image zoom" : "Zoom product image"}
          className="absolute inset-0 z-10 cursor-zoom-in"
          onClick={() => setZoomed((value) => !value)}
          type="button"
        />
        <Image
          alt={image.alt || product.name}
          className={`object-contain p-5 mix-blend-multiply drop-shadow-[0_24px_28px_rgba(15,17,21,0.24)] transition duration-500 ${zoomed ? "scale-150" : "scale-100"}`}
          fill
          loading="eager"
          priority={!compact}
          sizes={compact ? "(min-width: 1024px) 520px, 100vw" : "(min-width: 1024px) 50vw, 100vw"}
          src={image.url}
        />
        {images.length > 1 && (
          <>
            <button aria-label="Previous image" className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#0f1115]/80" onClick={() => show(activeIndex - 1)} type="button">←</button>
            <button aria-label="Next image" className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#0f1115]/80" onClick={() => show(activeIndex + 1)} type="button">→</button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2" role="list" aria-label="Product images">
          {images.map((entry, index) => (
            <button
              aria-label={`Show product image ${index + 1}`}
              aria-pressed={index === activeIndex}
              className={`relative aspect-square overflow-hidden rounded-xl border bg-[#f2efe7] ${index === activeIndex ? "border-[#c6ff3a]" : "border-[#2a2e36]"}`}
              key={entry.id}
              onClick={() => show(index)}
              type="button"
            >
              <Image alt="" className="object-contain p-1 mix-blend-multiply" fill sizes="96px" src={entry.url} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
