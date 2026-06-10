"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { archiveProduct, restoreProduct } from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";

export function AdminProductList({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | Product["category"]>("All");
  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          !product.archived &&
          (category === "All" || product.category === category) &&
          product.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [category, products, query],
  );

  return (
    <>
      <div className="mt-8 flex flex-col gap-3 rounded-2xl bg-[#181b21] p-4 sm:flex-row">
        <input
          className="h-11 flex-1 rounded-xl border px-4 text-sm"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products"
          type="search"
          value={query}
        />
        <div className="flex gap-2">
          {(["All", "Sneakers", "Running"] as const).map((value) => (
            <button
              className={`rounded-full px-4 py-2 text-xs font-semibold ${category === value ? "bg-neutral-950 text-[#f4f1ea]" : "bg-neutral-100"}`}
              key={value}
              onClick={() => setCategory(value)}
              type="button"
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl bg-[#181b21]">
        {filtered.map((product) => (
          <div className="grid gap-4 border-b p-5 last:border-0 sm:grid-cols-[1fr_auto_auto] sm:items-center" key={product.id}>
            <div>
              <strong>{product.name}</strong>
              <p className="mt-1 text-sm text-neutral-500">
                {product.category} / {formatPrice(product.price, "EGP")} / {product.published ? "Published" : "Draft"} / {product.sizes.filter((size) => size.available).length} sizes available
                {product.featured ? " / Featured" : ""}
              </p>
            </div>
            <Link className="text-sm font-semibold underline" href={`/admin/products/${product.id}`}>Edit</Link>
            <form action={archiveProduct}><input name="id" type="hidden" value={product.id} /><button className="text-sm text-red-700 underline" type="submit">Archive</button></form>
          </div>
        ))}
        {filtered.length === 0 && <p className="p-8 text-center text-neutral-500">No matching products.</p>}
      </div>
      {products.some((product) => product.archived) && (
        <details className="mt-6 rounded-2xl bg-[#181b21] p-5">
          <summary className="cursor-pointer font-semibold">
            Archived products ({products.filter((product) => product.archived).length})
          </summary>
          <div className="mt-4 divide-y">
            {products.filter((product) => product.archived).map((product) => (
              <div className="flex items-center justify-between gap-4 py-4" key={product.id}>
                <span className="text-sm">{product.name}</span>
                <form action={restoreProduct}>
                  <input name="id" type="hidden" value={product.id} />
                  <button className="text-sm font-semibold underline" type="submit">Restore</button>
                </form>
              </div>
            ))}
          </div>
        </details>
      )}
    </>
  );
}
