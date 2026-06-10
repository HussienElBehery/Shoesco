export {
  getAllProductsForAdmin,
  getFeaturedProducts,
  getProductById,
  getProducts,
} from "@/lib/catalog";

export async function getProductCategories() {
  const { getProducts } = await import("@/lib/catalog");
  const products = await getProducts();
  const counts = new Map<string, number>();
  products.forEach((product) =>
    counts.set(product.category, (counts.get(product.category) ?? 0) + 1),
  );
  return Array.from(counts, ([name, count]) => ({ name, count }));
}
