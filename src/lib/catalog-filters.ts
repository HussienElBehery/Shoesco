import type { Product, ProductCategory, ProductGender } from "@/types/product";

export type CatalogSort = "featured" | "newest" | "price-asc" | "price-desc";

export type CatalogFilters = {
  query: string;
  category: ProductCategory | "All";
  gender: ProductGender | "All";
  size: string;
  availability: "all" | "available" | "sold-out";
  minPrice: number | null;
  maxPrice: number | null;
  sort: CatalogSort;
};

export const defaultCatalogFilters: CatalogFilters = {
  query: "",
  category: "All",
  gender: "All",
  size: "",
  availability: "all",
  minPrice: null,
  maxPrice: null,
  sort: "featured",
};

export function parseCatalogFilters(params: URLSearchParams): CatalogFilters {
  const category = params.get("category");
  const gender = params.get("gender");
  const availability = params.get("availability");
  const sort = params.get("sort");
  const minPrice = Number(params.get("minPrice"));
  const maxPrice = Number(params.get("maxPrice"));

  return {
    query: params.get("q") ?? "",
    category:
      category === "Sneakers" ||
      category === "Running" ||
      category === "Shoe Care"
        ? category
        : "All",
    gender:
      gender === "Men" || gender === "Women" || gender === "Unisex"
        ? gender
        : "All",
    size: params.get("size") ?? "",
    availability:
      availability === "available" || availability === "sold-out"
        ? availability
        : "all",
    minPrice: Number.isFinite(minPrice) && minPrice > 0 ? minPrice : null,
    maxPrice: Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : null,
    sort:
      sort === "newest" || sort === "price-asc" || sort === "price-desc"
        ? sort
        : "featured",
  };
}

export function serializeCatalogFilters(filters: CatalogFilters) {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.category !== "All") params.set("category", filters.category);
  if (filters.gender !== "All") params.set("gender", filters.gender);
  if (filters.size) params.set("size", filters.size);
  if (filters.availability !== "all") {
    params.set("availability", filters.availability);
  }
  if (filters.minPrice !== null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.sort !== "featured") params.set("sort", filters.sort);
  return params;
}

export function filterAndSortProducts(
  products: Product[],
  filters: CatalogFilters,
) {
  const query = filters.query.trim().toLowerCase();
  const filtered = products.filter((product) => {
    const available = product.sizes.some((size) => size.available);
    const searchable = [
      product.name,
      product.shortDescription,
      product.description,
      product.colors.join(" "),
      product.merchandisingLabel,
    ]
      .join(" ")
      .toLowerCase();
    return (
      (!query || searchable.includes(query)) &&
      (filters.category === "All" || product.category === filters.category) &&
      (filters.gender === "All" || product.gender === filters.gender) &&
      (!filters.size ||
        product.sizes.some(
          (size) => size.size === filters.size && size.available,
        )) &&
      (filters.availability === "all" ||
        (filters.availability === "available" ? available : !available)) &&
      (filters.minPrice === null || product.price >= filters.minPrice) &&
      (filters.maxPrice === null || product.price <= filters.maxPrice)
    );
  });

  return [...filtered].sort((a, b) => {
    if (filters.sort === "newest") {
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    }
    if (filters.sort === "price-asc") return a.price - b.price;
    if (filters.sort === "price-desc") return b.price - a.price;
    return Number(b.featured) - Number(a.featured);
  });
}
