import type { Metadata } from "next";

import { ProductCatalog } from "@/components/product/ProductCatalog";
import { Container } from "@/components/ui/Container";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse Shoesoco sneakers and running shoes.",
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <Container className="pb-20 pt-6 sm:pb-28 sm:pt-8">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#181b21] px-6 py-12 sm:px-12 sm:py-16">
        <div className="absolute -right-16 -top-28 h-80 w-80 rounded-full bg-[#181b21]/60 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="eyebrow">Shoesoco collection</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">
            Find the pair that fits your pace.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg">
            Explore our focused collection of everyday sneakers and
            performance running shoes.
          </p>
        </div>
      </div>
      <ProductCatalog products={products} />
    </Container>
  );
}
