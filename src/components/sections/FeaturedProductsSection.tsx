import Link from "next/link";

import { ProductGrid } from "@/components/product/ProductGrid";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { Container } from "@/components/ui/Container";
import type { Product } from "@/types/product";

export function FeaturedProductsSection({ products }: { products: Product[] }) {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="flex items-start justify-between gap-4 sm:items-end sm:gap-6">
          <div>
            <p className="eyebrow">
              Curated for you
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
              A better daily rotation.
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-neutral-500">
              Sneakers for everyday style. Running shoes for forward motion.
            </p>
          </div>
          <Link
            className="flex shrink-0 items-center gap-2 rounded-full border border-[#2a2e36] px-4 py-2.5 text-xs font-semibold transition hover:border-[#c6ff3a] hover:text-[#c6ff3a] sm:text-sm"
            href="/products"
          >
            View all products
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
        <ProductGrid className="mt-10 lg:grid-cols-4" products={products} />
      </Container>
    </section>
  );
}
