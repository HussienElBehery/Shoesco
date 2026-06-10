import Link from "next/link";

import { HeroShoeCarousel } from "@/components/sections/HeroShoeCarousel";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { Container } from "@/components/ui/Container";
import type { StoreSettings } from "@/types/product";

export function HeroSection({ settings }: { settings: StoreSettings }) {
  return (
    <section className="overflow-hidden pb-8 pt-5 sm:pb-12 sm:pt-8">
      <Container>
        <div className="relative min-h-[650px] overflow-hidden rounded-[2rem] border border-white/60 bg-[#e9e4da] px-6 py-12 shadow-[0_25px_80px_rgba(48,42,32,0.08)] sm:px-12 lg:min-h-[680px] lg:px-16 lg:py-16">
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.35),transparent_48%)]" />
          <div className="absolute -right-28 -top-40 h-[480px] w-[480px] rounded-full bg-white/55 blur-3xl" />
          <div className="absolute -bottom-56 left-1/4 h-[480px] w-[480px] rounded-full bg-[#c4a77e]/30 blur-3xl" />

          <div className="relative z-10 max-w-2xl lg:max-w-[52%]">
            <p className="eyebrow">
              {settings.heroEyebrow}
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-8xl">
              {settings.heroTitle}
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-neutral-600 sm:text-lg">
              {settings.heroDescription}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center gap-3 rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#9a7042]"
                href="/products"
              >
                Shop the collection
                <ArrowIcon className="h-4 w-4" />
              </Link>
              <Link
                className="rounded-full border border-neutral-500/30 bg-white/30 px-6 py-3.5 text-sm font-semibold backdrop-blur transition hover:bg-white/70"
                href="/about"
              >
                Our story
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 border-t border-black/10 pt-5 text-xs text-neutral-500">
              <span>
                <strong className="block text-base text-neutral-950">2</strong>
                Focused categories
              </span>
              <span className="h-8 w-px bg-black/10" />
              <span>
                <strong className="block text-base text-neutral-950">Direct</strong>
                WhatsApp service
              </span>
            </div>
          </div>

          <div className="relative z-[5] mt-14 h-48 w-full sm:h-64 md:absolute md:bottom-20 md:right-[-3%] md:mt-0 md:h-[270px] md:w-[56%] lg:bottom-24 lg:right-[-1%] lg:h-[330px] lg:w-[55%]">
            <HeroShoeCarousel />
          </div>

          <div className="absolute bottom-6 right-6 z-10 hidden rounded-2xl border border-white/70 bg-white/75 px-4 py-3 text-xs font-semibold shadow-lg backdrop-blur md:bottom-10 md:right-10 md:block">
            Selected for comfort
            <span className="mt-1 block font-normal text-neutral-500">
              Designed for daily movement
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
