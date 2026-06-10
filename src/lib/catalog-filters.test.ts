import { describe, expect, it } from "vitest";

import { products } from "../data/products";
import {
  defaultCatalogFilters,
  filterAndSortProducts,
  parseCatalogFilters,
  serializeCatalogFilters,
} from "./catalog-filters";

describe("catalog filters", () => {
  it("round-trips URL state", () => {
    const filters = {
      ...defaultCatalogFilters,
      query: "runner",
      category: "Running" as const,
      gender: "Men" as const,
      size: "42",
      availability: "available" as const,
      minPrice: 3000,
      maxPrice: 5000,
      sort: "price-desc" as const,
    };
    expect(parseCatalogFilters(serializeCatalogFilters(filters))).toEqual(filters);
  });

  it("filters searchable product content and available sizes", () => {
    const result = filterAndSortProducts(products, {
      ...defaultCatalogFilters,
      query: "responsive",
      category: "Running",
      size: "42",
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((product) => product.category === "Running")).toBe(true);
  });

  it("sorts products by ascending price", () => {
    const result = filterAndSortProducts(products, {
      ...defaultCatalogFilters,
      sort: "price-asc",
    });
    expect(result.map((product) => product.price)).toEqual(
      [...result].map((product) => product.price).sort((a, b) => a - b),
    );
  });
});
