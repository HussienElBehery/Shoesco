import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductArtwork } from "@/components/product/ProductArtwork";
import { ProductPurchasePanel } from "@/components/cart/ProductPurchasePanel";
import { Container } from "@/components/ui/Container";
import { formatPrice } from "@/lib/format";
import { getProductById } from "@/lib/products";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  return {
    title: product?.name ?? "Product not found",
    description: product?.shortDescription,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <Container className="py-12 sm:py-16 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-[#eeeae1]">
          <ProductArtwork
            product={product}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
          <span
            className={`absolute left-5 top-5 rounded-full px-4 py-2 text-xs font-semibold shadow-sm ${
              product.sizes.some((size) => size.available)
                ? "bg-white/90 text-neutral-800"
                : "bg-neutral-950 text-white"
            }`}
          >
            {product.sizes.some((size) => size.available)
              ? "Available"
              : "Currently unavailable"}
          </span>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a7042]">
            {product.category} / {product.gender}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-5 text-2xl font-semibold">
            {formatPrice(product.price, product.currency)}
          </p>
          <p className="mt-6 max-w-xl leading-7 text-neutral-600">
            {product.description}
          </p>

          <ProductPurchasePanel product={product} />
        </div>
      </div>
    </Container>
  );
}
