"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";

const heroShoes = [
  {
    category: "Sneakers",
    name: "Everyday white sneaker",
    src: "/images/products/sneaker.png",
  },
  {
    category: "Running",
    name: "Performance running shoe",
    src: "/images/hero/running.png",
  },
];

export function HeroShoeCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % heroShoes.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full w-full">
      <div className="absolute bottom-[10%] left-1/2 h-10 w-[72%] -translate-x-1/2 rounded-full bg-black/20 blur-2xl" />

      {heroShoes.map((shoe, index) => (
        <Image
          alt={shoe.name}
          className={cn(
            "object-contain drop-shadow-[0_30px_35px_rgba(42,35,27,0.22)] transition duration-700 ease-out md:-rotate-6",
            index === activeIndex
              ? "scale-100 opacity-100"
              : "pointer-events-none scale-95 opacity-0",
          )}
          fill
          key={shoe.src}
          priority={index === 0}
          sizes="(min-width: 768px) 56vw, 100vw"
          src={shoe.src}
        />
      ))}

      <div className="absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/70 px-3 py-2 shadow-sm backdrop-blur">
        <span className="mr-1 hidden text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-600 sm:inline">
          {heroShoes[activeIndex].category}
        </span>
        {heroShoes.map((shoe, index) => (
          <button
            aria-label={`Show ${shoe.category} shoe`}
            aria-pressed={index === activeIndex}
            className={cn(
              "h-2 rounded-full transition-all",
              index === activeIndex
                ? "w-5 bg-neutral-900"
                : "w-2 bg-neutral-400 hover:bg-neutral-600",
            )}
            key={shoe.src}
            onClick={() => setActiveIndex(index)}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
