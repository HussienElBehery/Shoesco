"use client";

import Link from "next/link";
import { useEffect } from "react";

import { ProductPurchasePanel } from "@/components/cart/ProductPurchasePanel";
import { ProductGallery } from "@/components/product/ProductGallery";
import { Drawer } from "@/components/ui/Drawer";
import { trackEvent } from "@/lib/analytics";
import { formatPrice } from "@/lib/format";
import { formatGender } from "@/lib/product-labels";
import type { Product } from "@/types/product";

export function ProductQuickView({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (product) trackEvent("product_view", { productId: product.id, source: "quick-view" });
  }, [product]);

  return (
    <Drawer onClose={onClose} open={Boolean(product)} title="Quick preview">
      {product && (
        <div className="bg-[radial-gradient(circle_at_top_right,rgba(198,255,58,0.06),transparent_28%)] p-5 sm:p-6">
          <ProductGallery compact key={product.id} product={product} />
          <p className="mt-7 editorial-label text-[#c6ff3a]">
            {product.category} / {formatGender(product.gender)}
          </p>
          <div className="mt-2 flex items-start justify-between gap-5">
            <h2 className="text-3xl font-semibold tracking-tight">{product.name}</h2>
            <strong className="shrink-0">{formatPrice(product.price, product.currency)}</strong>
          </div>
          <p className="mt-4 leading-7 text-neutral-500">{product.shortDescription}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#2a2e36] p-4">
              <span className="text-xs text-neutral-500">Fit</span>
              <strong className="mt-1 block text-sm">{product.fit}</strong>
            </div>
            <div className="rounded-2xl border border-[#2a2e36] p-4">
              <span className="text-xs text-neutral-500">Width</span>
              <strong className="mt-1 block text-sm">{product.width}</strong>
            </div>
          </div>
          <ProductPurchasePanel compact product={product} />
          <Link className="mt-5 flex justify-center text-sm font-semibold underline" href={`/products/${product.id}`}>
            View full product details
          </Link>
        </div>
      )}
    </Drawer>
  );
}
