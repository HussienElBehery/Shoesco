"use client";

import { useMemo, useState } from "react";

import { ProductGrid } from "@/components/product/ProductGrid";
import type { Product } from "@/types/product";

type ProductCatalogProps = {
  products: Product[];
  initialCategory?: Product["category"] | "All";
};

export function ProductCatalog({
  products,
  initialCategory = "All",
}: ProductCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const categories = useMemo<Array<Product["category"] | "All">>(
    () => [
      "All",
      ...Array.from(new Set(products.map((product) => product.category))),
    ],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      const matchesSearch = product.name
        .toLowerCase()
        .includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="mt-8 scroll-mt-24" id="catalog">
      <div className="sticky top-16 z-30 rounded-[1.5rem] border border-neutral-200/80 bg-[#fcfcfa]/90 p-4 shadow-[0_12px_35px_rgba(30,28,24,0.05)] backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" aria-label="Product categories">
            {categories.map((category) => {
              const isSelected = category === selectedCategory;

              return (
                <button
                  aria-pressed={isSelected}
                  className={`rounded-full px-4 py-2.5 text-xs font-semibold transition ${
                    isSelected
                      ? "bg-neutral-950 text-white"
                      : "bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-100 hover:text-neutral-950"
                  }`}
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  type="button"
                >
                  {category === "All" ? "All shoes" : category}
                </button>
              );
            })}
          </div>

          <label className="relative block w-full lg:w-80">
            <span className="sr-only">Search products by name</span>
            <svg
              aria-hidden="true"
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              fill="none"
              viewBox="0 0 20 20"
            >
              <circle
                cx="8.5"
                cy="8.5"
                r="5.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="m13 13 4 4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
              />
            </svg>
            <input
              className="h-11 w-full rounded-full border border-neutral-200 bg-white pl-11 pr-4 text-sm shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by product name"
              type="search"
              value={searchQuery}
            />
          </label>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p aria-live="polite" className="text-sm text-neutral-500">
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1 ? "product" : "products"}
        </p>
        {(searchQuery || selectedCategory !== "All") && (
          <button
            className="text-sm font-semibold underline decoration-neutral-300 transition hover:decoration-neutral-950"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            type="button"
          >
            Clear filters
          </button>
        )}
      </div>

      {filteredProducts.length > 0 ? (
        <ProductGrid className="mt-8" products={filteredProducts} />
      ) : (
        <div className="mt-8 rounded-[1.75rem] bg-neutral-100 px-6 py-16 text-center">
          <h2 className="text-xl font-semibold">No matching shoes found</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Try another name or select a different category.
          </p>
        </div>
      )}
    </div>
  );
}
