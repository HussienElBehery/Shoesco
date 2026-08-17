"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductQuickView } from "@/components/product/ProductQuickView";
import { Drawer } from "@/components/ui/Drawer";
import { trackEvent } from "@/lib/analytics";
import {
  defaultCatalogFilters,
  filterAndSortProducts,
  parseCatalogFilters,
  serializeCatalogFilters,
  type CatalogFilters,
} from "@/lib/catalog-filters";
import { CATALOG_GENDER_OPTIONS } from "@/lib/product-labels";
import type { Product } from "@/types/product";

function FilterFields({
  filters,
  setFilters,
  products,
}: {
  filters: CatalogFilters;
  setFilters: (filters: CatalogFilters) => void;
  products: Product[];
}) {
  const sizes = Array.from(
    new Set(products.flatMap((product) => product.sizes.map((size) => size.size))),
  )
    .filter((size) => {
      const normalized = size.trim();
      return normalized !== "" && normalized !== "-" && normalized !== "_";
    })
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  function update<K extends keyof CatalogFilters>(
    key: K,
    value: CatalogFilters[K],
  ) {
    setFilters({ ...filters, [key]: value });
  }

  const selectClass =
    "h-11 min-w-0 w-full rounded-xl border border-[#2a2e36] bg-[#181b21] px-3 text-sm";

  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-6">
      <label className="grid gap-2 text-xs font-semibold text-neutral-400">
        Category
        <select className={selectClass} onChange={(event) => update("category", event.target.value as CatalogFilters["category"])} value={filters.category}>
          <option value="All">All categories</option>
          <option value="Sneakers">Sneakers</option>
          <option value="Running">Running</option>
          <option value="Shoe Care">Shoe Care</option>
        </select>
      </label>
      <label className="grid gap-2 text-xs font-semibold text-neutral-400">
        Gender
        <select className={selectClass} onChange={(event) => update("gender", event.target.value as CatalogFilters["gender"])} value={filters.gender}>
          <option value="All">All</option>
          {CATALOG_GENDER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-xs font-semibold text-neutral-400">
        Size
        <select className={selectClass} onChange={(event) => update("size", event.target.value)} value={filters.size}>
          <option value="">Any size</option>
          {sizes.map((size) => <option key={size}>{size}</option>)}
        </select>
      </label>
      <label className="grid gap-2 text-xs font-semibold text-neutral-400">
        Availability
        <select className={selectClass} onChange={(event) => update("availability", event.target.value as CatalogFilters["availability"])} value={filters.availability}>
          <option value="all">All</option>
          <option value="available">Available</option>
          <option value="sold-out">Sold out</option>
        </select>
      </label>
      <label className="grid gap-2 text-xs font-semibold text-neutral-400">
        Min price
        <input className={selectClass} min="0" onChange={(event) => update("minPrice", event.target.value ? Number(event.target.value) : null)} placeholder="EGP" type="number" value={filters.minPrice ?? ""} />
      </label>
      <label className="grid gap-2 text-xs font-semibold text-neutral-400">
        Max price
        <input className={selectClass} min="0" onChange={(event) => update("maxPrice", event.target.value ? Number(event.target.value) : null)} placeholder="EGP" type="number" value={filters.maxPrice ?? ""} />
      </label>
    </div>
  );
}

export function ProductCatalog({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [filters, setFilters] = useState(() =>
    parseCatalogFilters(new URLSearchParams(searchParams.toString())),
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  useEffect(() => {
    const next = serializeCatalogFilters(filters);
    const query = next.toString();
    const currentQuery = window.location.search.replace(/^\?/, "");
    if (query !== currentQuery) {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }
    trackEvent("filter_use", {
      category: filters.category,
      gender: filters.gender,
      size: filters.size,
      sort: filters.sort,
    });
  }, [filters, pathname, router]);

  const filteredProducts = useMemo(
    () => filterAndSortProducts(products, filters),
    [filters, products],
  );

  const activeFilterCount = [
    filters.category !== "All",
    filters.gender !== "All",
    Boolean(filters.size),
    filters.availability !== "all",
    filters.minPrice !== null,
    filters.maxPrice !== null,
  ].filter(Boolean).length;

  return (
    <div className="mt-8 min-w-0 max-w-full scroll-mt-24" id="catalog">
      <div className="sticky top-20 z-30 rounded-[1.75rem] border border-[#3a3f49] bg-[#181b21]/95 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search products</span>
            <input
              className="h-12 w-full rounded-full border border-[#3a3f49] bg-[#0f1115] px-5 text-sm transition placeholder:text-neutral-500 focus:border-[#c6ff3a]"
              disabled={!hydrated}
              onChange={(event) => setFilters({ ...filters, query: event.target.value })}
              placeholder="Search products, colors, or collections"
              type="search"
              value={filters.query}
            />
          </label>
          <div className="grid min-w-0 grid-cols-2 gap-3 lg:flex">
            <button className="rounded-full border border-[#2a2e36] px-5 py-3 text-sm font-semibold lg:hidden" onClick={() => setFiltersOpen(true)} type="button">
              Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
            </button>
            <div className="relative min-w-0">
              <select
                aria-label="Sort products"
                className="w-full min-w-0 appearance-none rounded-full border border-[#3a3f49] bg-[#0f1115] py-3 pl-5 pr-11 text-sm font-semibold transition focus:border-[#c6ff3a]"
                onChange={(event) => setFilters({ ...filters, sort: event.target.value as CatalogFilters["sort"] })}
                value={filters.sort}
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path d="m8 10 4 4 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              </svg>
            </div>
          </div>
        </div>
        <div className="mt-4 hidden lg:block">
          <FilterFields filters={filters} products={products} setFilters={setFilters} />
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between gap-4">
        <p aria-live="polite" className="text-sm text-neutral-500">
          {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
        </p>
        {(filters.query || activeFilterCount || filters.sort !== "featured") && (
          <button className="text-sm font-semibold underline" onClick={() => setFilters(defaultCatalogFilters)} type="button">
            Clear filters
          </button>
        )}
      </div>

      {filteredProducts.length ? (
        <ProductGrid className="mt-8" onQuickView={setQuickView} products={filteredProducts} />
      ) : (
        <div className="mt-8 rounded-[1.75rem] border border-[#2a2e36] bg-[#181b21] px-6 py-16 text-center">
          <h2 className="text-xl font-semibold">No matching products found</h2>
          <p className="mt-2 text-sm text-neutral-500">Try a wider price range or clear one of the filters.</p>
        </div>
      )}

      <Drawer onClose={() => setFiltersOpen(false)} open={filtersOpen} side="left" title="Filter the collection">
        <div className="p-5">
          <FilterFields filters={filters} products={products} setFilters={setFilters} />
          <button className="mt-6 w-full rounded-full bg-[#c6ff3a] px-5 py-3.5 font-semibold text-[#0f1115]" onClick={() => setFiltersOpen(false)} type="button">
            Show {filteredProducts.length} products
          </button>
        </div>
      </Drawer>
      <ProductQuickView onClose={() => setQuickView(null)} product={quickView} />
    </div>
  );
}
