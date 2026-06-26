import Link from "next/link";

import { HeroShoeCarousel } from "@/components/sections/HeroShoeCarousel";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { Container } from "@/components/ui/Container";
import type { StoreSettings } from "@/types/product";

export function HeroSection({
  settings,
}: {
  settings: StoreSettings;
}) {
  return (
    <section className="overflow-hidden pb-8 pt-5 sm:pb-12 sm:pt-8">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] border border-[#2a2e36] bg-[#181b21] px-6 py-9 shadow-[0_25px_80px_rgba(0,0,0,0.28)] sm:px-12 sm:py-12 lg:min-h-[700px] lg:px-14 lg:py-12">
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(244,241,234,0.04),transparent_42%,rgba(198,255,58,0.04))]" />
          <div className="absolute -right-28 -top-40 h-[480px] w-[480px] rounded-full bg-[#2a2e36]/70 blur-3xl" />
          <div className="absolute -bottom-56 left-1/3 h-[520px] w-[520px] rounded-full bg-[#c6ff3a]/20 blur-3xl" />

          <div className="relative z-10 grid items-center gap-10 lg:min-h-[600px] lg:grid-cols-[0.88fr_1.12fr] lg:gap-10">
            <div className="max-w-2xl">
              <p className="eyebrow">
                {settings.heroEyebrow}
              </p>
              <h1 className="mt-6 text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                {settings.heroTitle}
              </h1>
              <p className="mt-7 max-w-lg text-base leading-7 text-neutral-600 sm:text-lg">
                {settings.heroDescription}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  className="inline-flex items-center gap-3 rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-[#f4f1ea] transition hover:bg-[#c6ff3a] hover:text-[#0f1115]"
                  href="/products"
                >
                  Shop the collection
                  <ArrowIcon className="h-4 w-4" />
                </Link>
                <Link
                  className="rounded-full border border-neutral-500/30 bg-[#181b21]/30 px-6 py-3.5 text-sm font-semibold backdrop-blur transition hover:bg-[#181b21]/70"
                  href="/about"
                >
                  Our story
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-6 border-t border-[#2a2e36] pt-5 text-xs text-neutral-500">
                <span>
                  <strong className="block text-base text-[#f4f1ea]">3</strong>
                  Focused categories
                </span>
                <span className="h-8 w-px bg-[#2a2e36]" />
                <span>
                  <strong className="block text-base text-[#f4f1ea]">Direct</strong>
                  WhatsApp service
                </span>
              </div>
            </div>

            <div className="relative h-[360px] min-w-0 sm:h-[430px] lg:h-[520px]">
              <HeroShoeCarousel />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
