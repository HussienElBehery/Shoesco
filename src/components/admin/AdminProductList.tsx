"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  archiveProduct,
  deleteArchivedProduct,
  restoreProduct,
} from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";
import { formatGender } from "@/lib/product-labels";
import type { Product } from "@/types/product";

type ProductView = "Published" | "Drafts" | "Featured" | "Archived" | "All";

const productViews: ProductView[] = [
  "Published",
  "Drafts",
  "Featured",
  "Archived",
  "All",
];

function matchesView(product: Product, view: ProductView) {
  if (view === "Published") return product.published && !product.archived;
  if (view === "Drafts") return !product.published && !product.archived;
  if (view === "Featured") return product.featured && !product.archived;
  if (view === "Archived") return product.archived;
  return true;
}

export function AdminProductList({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | Product["category"]>("All");
  const [view, setView] = useState<ProductView>("Published");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter(
      (product) =>
        matchesView(product, view) &&
        (category === "All" || product.category === category) &&
        (!normalized ||
          product.name.toLowerCase().includes(normalized) ||
          product.slug.toLowerCase().includes(normalized)),
    );
  }, [category, products, query, view]);

  const counts = {
    Published: products.filter((product) => matchesView(product, "Published")).length,
    Drafts: products.filter((product) => matchesView(product, "Drafts")).length,
    Featured: products.filter((product) => matchesView(product, "Featured")).length,
    Archived: products.filter((product) => matchesView(product, "Archived")).length,
    All: products.length,
  } satisfies Record<ProductView, number>;

  return (
    <>
      <div className="mt-8 grid gap-4 rounded-2xl border border-[#2a2e36] bg-[#181b21] p-4">
        <div className="flex flex-wrap gap-2">
          {productViews.map((value) => (
            <button
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                view === value
                  ? "bg-[#c6ff3a] text-[#0f1115]"
                  : "border border-[#2a2e36] text-neutral-400 hover:text-[#f4f1ea]"
              }`}
              key={value}
              onClick={() => setView(value)}
              type="button"
            >
              {value} ({counts[value]})
            </button>
          ))}
        </div>
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <input
            className="h-11 rounded-xl border border-[#2a2e36] bg-[#0f1115] px-4 text-sm"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products or slugs"
            type="search"
            value={query}
          />
          <div className="flex flex-wrap gap-2">
            {(["All", "Sneakers", "Running", "Shoe Care"] as const).map((value) => (
              <button
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  category === value ? "bg-neutral-100 text-[#0f1115]" : "border border-[#2a2e36] text-neutral-400"
                }`}
                key={value}
                onClick={() => setCategory(value)}
                type="button"
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-[#2a2e36] bg-[#181b21]">
        {filtered.map((product) => {
          const availableCount = product.sizes.filter((size) => size.available).length;
          const isLive = product.published && !product.archived;
          return (
            <div className="grid gap-4 border-b border-[#2a2e36] p-5 last:border-0 lg:grid-cols-[1fr_auto] lg:items-center" key={product.id}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <strong>{product.name}</strong>
                  {isLive && <span className="rounded-full bg-[#c6ff3a] px-2 py-1 text-[10px] font-bold text-[#0f1115]">Live</span>}
                  {!product.published && !product.archived && <span className="rounded-full border border-[#2a2e36] px-2 py-1 text-[10px] font-bold text-neutral-400">Draft</span>}
                  {product.archived && <span className="rounded-full border border-red-400/40 px-2 py-1 text-[10px] font-bold text-red-300">Archived</span>}
                  {product.featured && !product.archived && <span className="rounded-full border border-[#c6ff3a]/40 px-2 py-1 text-[10px] font-bold text-[#c6ff3a]">Featured</span>}
                </div>
                <p className="mt-2 text-sm text-neutral-500">
                  {product.category} / {formatGender(product.gender)} / {formatPrice(product.price, "EGP")} / {availableCount} available sizes
                </p>
                {availableCount === 0 && <p className="mt-2 text-xs text-amber-200">No available sizes. Customers will see this as sold out.</p>}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Link className="font-semibold underline" href={`/admin/products/${product.id}`}>Edit</Link>
                {isLive && <Link className="font-semibold underline" href={`/products/${product.id}`} target="_blank">View public</Link>}
                {product.archived ? (
                  <>
                    <form action={restoreProduct}>
                      <input name="id" type="hidden" value={product.id} />
                      <button className="font-semibold underline" type="submit">Restore</button>
                    </form>
                    <form
                      action={deleteArchivedProduct}
                      onSubmit={(event) => {
                        if (!window.confirm(`Delete ${product.name} forever?`)) {
                          event.preventDefault();
                        }
                      }}
                    >
                      <input name="id" type="hidden" value={product.id} />
                      <button className="font-semibold text-red-300 underline" type="submit">Delete forever</button>
                    </form>
                  </>
                ) : (
                  <form action={archiveProduct}>
                    <input name="id" type="hidden" value={product.id} />
                    <button className="font-semibold text-red-300 underline" type="submit">Archive</button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="p-8 text-center text-neutral-500">No products match these filters.</p>}
      </div>
    </>
  );
}
