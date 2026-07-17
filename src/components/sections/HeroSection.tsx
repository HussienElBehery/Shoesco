import Link from "next/link";

import { ProductArtwork } from "@/components/product/ProductArtwork";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { Container } from "@/components/ui/Container";
import { formatPrice } from "@/lib/format";
import { normalizeHomepageEyebrow } from "@/lib/homepage";
import type { Product, StoreSettings } from "@/types/product";

export function HeroSection({
  settings,
  product,
}: {
  settings: StoreSettings;
  product?: Product;
}) {
  const heroEyebrow = normalizeHomepageEyebrow(settings.heroEyebrow);

  return (
    <section className="pb-8 pt-5 sm:pb-12 sm:pt-8">
      <Container>
        <div className="overflow-hidden rounded-[2rem] border border-[#2a2e36] bg-[#181b21] shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="grid items-stretch lg:min-h-[480px] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex max-w-2xl flex-col justify-center px-7 py-10 sm:px-11 sm:py-12 lg:px-14">
              <p className="eyebrow">{heroEyebrow}</p>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                {settings.heroTitle}
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-neutral-400 sm:text-base">
                {settings.heroDescription}
              </p>
              <Link
                className="mt-7 inline-flex w-fit items-center gap-3 rounded-full bg-[#c6ff3a] px-6 py-3.5 text-sm font-semibold text-[#0f1115] transition hover:bg-[#d4ff6b]"
                href="/products"
              >
                Shop Now
                <ArrowIcon className="h-4 w-4" />
              </Link>
            </div>

            {product ? (
              <Link
                aria-label={`View ${product.name}`}
                className="group relative min-h-[300px] overflow-hidden bg-[#f2efe7] sm:min-h-[380px] lg:min-h-[480px]"
                href={`/products/${product.id}`}
              >
                <ProductArtwork
                  className="transition duration-700 group-hover:scale-[1.03]"
                  priority
                  product={product}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                />
                <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 rounded-2xl bg-[#0f1115]/90 px-5 py-4 text-[#f4f1ea] backdrop-blur sm:inset-x-7 sm:bottom-7">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#c6ff3a]">Featured pair</p>
                    <p className="mt-1 font-semibold">{product.name}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold">{formatPrice(product.price, product.currency)}</p>
                </div>
              </Link>
            ) : (
              <div className="flex min-h-[280px] items-center justify-center bg-[#101216] px-8 text-center text-3xl font-semibold tracking-[0.2em] text-neutral-600 lg:min-h-[480px]">
                SHOESOCO
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
