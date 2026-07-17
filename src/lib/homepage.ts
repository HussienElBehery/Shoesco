import type { Product } from "@/types/product";

export function selectHomepageHeroProduct(
  products: Product[],
  selectedProductId: string | null,
) {
  return (
    products.find((product) => product.id === selectedProductId) ??
    products.find((product) => product.featured) ??
    products[0]
  );
}

export function normalizeHomepageEyebrow(value: string) {
  return value
    .split("/")
    .map((category) => category.trim())
    .filter(
      (category) =>
        category && category.toLowerCase() !== "crease protector",
    )
    .join(" / ");
}
