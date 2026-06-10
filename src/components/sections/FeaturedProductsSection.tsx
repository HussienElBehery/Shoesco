import Link from "next/link";

import { ProductGrid } from "@/components/product/ProductGrid";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { Container } from "@/components/ui/Container";
import { getFeaturedProducts } from "@/lib/products";

export async function FeaturedProductsSection() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="flex items-end justify-between gap-6">
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
            className="hidden items-center gap-2 text-sm font-semibold sm:flex"
            href="/products"
          >
            View all
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </div>
        <ProductGrid className="mt-10" products={featuredProducts} />
      </Container>
    </section>
  );
}
