"use client";

import { useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { trackEvent } from "@/lib/analytics";
import type { Product } from "@/types/product";

export function ProductPurchasePanel({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const availableSizes = product.sizes.filter((size) => size.available);
  const [size, setSize] = useState(availableSizes[0]?.size ?? "");
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [added, setAdded] = useState(false);
  const { addItem, isHydrated } = useCart();
  const canAdd = Boolean(size && color && isHydrated);

  return (
    <div className="mt-8 rounded-[1.75rem] border border-[#2a2e36] bg-[#181b21] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.18)] sm:p-6">
      <div className={`grid gap-7 ${compact ? "" : "sm:grid-cols-2"}`}>
        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-[0.18em]">
            Select size
          </legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {product.sizes.map((option) => (
              <button
                className={`flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm transition ${
                  size === option.size
                    ? "border-neutral-950 bg-neutral-950 text-[#f4f1ea]"
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
                    ? "bg-neutral-950 text-[#f4f1ea]"
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
        className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[#c6ff3a] px-7 py-4 text-base font-bold text-[#0f1115] shadow-[0_12px_35px_rgba(198,255,58,0.2)] transition duration-200 hover:bg-[#d4ff6b] hover:shadow-[0_14px_40px_rgba(198,255,58,0.32)] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#2a2e36] disabled:text-neutral-500 disabled:shadow-none"
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
            availableSizes: availableSizes.map((entry) => entry.size),
            availableColors: product.colors,
          });
          trackEvent("add_to_cart", {
            productId: product.id,
            category: product.category,
            size,
            color,
          });
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1800);
        }}
        type="button"
      >
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
          <path d="M6.75 8.25h10.5l.75 11.25H6L6.75 8.25Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M9 9V6.75a3 3 0 0 1 6 0V9" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
        <span aria-live="polite">
        {added
          ? "Added to cart"
          : !isHydrated
            ? "Loading cart..."
            : canAdd
              ? "Add to cart"
              : "Currently sold out"}
        </span>
      </button>
    </div>
  );
}
