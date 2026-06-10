"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";

export function HeroShoeCarousel({ products }: { products: Product[] }) {
  const sneaker = products.find(
    (product) => product.category === "Sneakers" && product.images[0]?.url,
  );
  const runner = products.find(
    (product) => product.category === "Running" && product.images[0]?.url,
  );
  const heroShoes = [sneaker, runner].filter(
    (product): product is Product => Boolean(product),
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    if (heroShoes.length < 2) return;
    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % heroShoes.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, [heroShoes.length]);

  if (!heroShoes.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-neutral-500">
        Featured products coming soon
      </div>
    );
  }

  const activeProduct = heroShoes[activeIndex] ?? heroShoes[0];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[1.75rem] border border-[#2a2e36] bg-[#101216]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(244,241,234,0.04),transparent_45%,rgba(198,255,58,0.09))]" />
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[55px] border-[#c6ff3a]/[0.04]" />
      <p
        aria-hidden="true"
        className="absolute left-1/2 top-[8%] -translate-x-1/2 whitespace-nowrap text-[clamp(4.5rem,10vw,8.5rem)] font-black leading-none tracking-[-0.09em] text-[#f4f1ea]/[0.055]"
      >
        SHOESOCO
      </p>
      <div className="absolute bottom-[18%] left-1/2 h-12 w-[72%] -translate-x-1/2 rounded-full bg-black/55 blur-2xl" />

      {heroShoes.map((product, index) => (
        <Image
          alt={product.images[0]?.alt || product.name}
          className={cn(
            "object-contain px-5 pb-24 pt-16 drop-shadow-[0_35px_38px_rgba(0,0,0,0.5)] transition duration-700 ease-out sm:px-9 sm:pb-28 sm:pt-20",
            index === activeIndex
              ? "translate-x-0 rotate-0 scale-100 opacity-100"
              : "pointer-events-none translate-x-10 -rotate-3 scale-95 opacity-0",
          )}
          fill
          key={product.id}
          priority={index === 0}
          sizes="(min-width: 768px) 56vw, 100vw"
          src={product.images[0].url}
        />
      ))}

      <div className="absolute left-4 top-4 z-20 grid gap-2 sm:left-6 sm:top-6">
        {heroShoes.map((product, index) => (
          <button
            aria-label={`Show ${product.category} shoe`}
            aria-pressed={index === activeIndex}
            className={cn(
              "flex items-center gap-3 rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] transition sm:px-4",
              index === activeIndex
                ? "border-[#c6ff3a] bg-[#c6ff3a] text-[#0f1115]"
                : "border-[#2a2e36] bg-[#0f1115]/80 text-neutral-400 hover:text-[#f4f1ea]",
            )}
            key={product.id}
            onClick={() => setActiveIndex(index)}
            type="button"
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {product.category}
          </button>
        ))}
      </div>

      <div className="absolute inset-x-4 bottom-4 z-20 flex items-end justify-between gap-4 rounded-2xl border border-[#2a2e36] bg-[#0f1115]/85 p-4 backdrop-blur-md sm:inset-x-6 sm:bottom-6 sm:p-5">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c6ff3a]">
            {activeProduct.merchandisingLabel || activeProduct.category}
          </p>
          <p className="mt-1 truncate text-lg font-semibold">
            {activeProduct.name}
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            {formatPrice(activeProduct.price, activeProduct.currency)}
          </p>
        </div>
        <Link
          className="shrink-0 rounded-full border border-[#3a3f49] px-4 py-2 text-xs font-semibold transition hover:border-[#c6ff3a] hover:text-[#c6ff3a]"
          href={`/products/${activeProduct.id}`}
        >
          View pair
        </Link>
      </div>
    </div>
  );
}
