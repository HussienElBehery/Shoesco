"use client";

import { useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import type { Product } from "@/types/product";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const availableSizes = product.sizes.filter((size) => size.available);
  const [size, setSize] = useState(availableSizes[0]?.size ?? "");
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const canAdd = Boolean(size && color);

  return (
    <div className="mt-8 border-t border-neutral-200 pt-7">
      <div className="grid gap-7 sm:grid-cols-2">
        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-[0.18em]">
            Select size
          </legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {product.sizes.map((option) => (
              <button
                className={`flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm transition ${
                  size === option.size
                    ? "border-neutral-950 bg-neutral-950 text-white"
                    : option.available
                      ? "border-neutral-300 hover:border-neutral-950"
                      : "cursor-not-allowed border-neutral-200 text-neutral-300 line-through"
                }`}
                disabled={!option.available}
                key={option.id}
                onClick={() => setSize(option.size)}
                type="button"
              >
                {option.size}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-[0.18em]">
            Select color
          </legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {product.colors.map((option) => (
              <button
                className={`rounded-full px-4 py-2 text-sm transition ${
                  color === option
                    ? "bg-neutral-950 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
                key={option}
                onClick={() => setColor(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <button
        className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-neutral-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#9a7042] disabled:cursor-not-allowed disabled:bg-neutral-300 sm:w-auto"
        disabled={!canAdd}
        onClick={() => {
          addItem({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.images[0]?.url ?? "",
            size,
            color,
            unitPrice: product.price,
          });
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1800);
        }}
        type="button"
      >
        {added ? "Added to cart" : canAdd ? "Add to cart" : "Currently sold out"}
      </button>
    </div>
  );
}
