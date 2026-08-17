import Link from "next/link";

import { ProductArtwork } from "@/components/product/ProductArtwork";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { formatPrice } from "@/lib/format";
import { formatGender } from "@/lib/product-labels";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
  onQuickView?: (product: Product) => void;
  priority?: boolean;
};

export function ProductCard({ product, onQuickView, priority = false }: ProductCardProps) {
  const href = `/products/${product.id}`;
  const artworkBackgrounds = [
    "bg-[#181b21]",
    "bg-[#20242b]",
    "bg-[#20242b]",
    "bg-[#181b21]",
  ];
  const background =
    artworkBackgrounds[
      Number(product.id.replace(/\D/g, "")) % artworkBackgrounds.length
    ];

  return (
    <article className="group flex min-w-0 h-full flex-col rounded-[2rem] border border-[#2a2e36] bg-[#181b21] p-2 shadow-[0_18px_60px_rgba(0,0,0,0.2)] transition duration-300 hover:-translate-y-1 hover:border-[#3a3f49] hover:shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
      <div className={`relative overflow-hidden rounded-[1.75rem] ${background}`}>
        <Link className="block" href={href}>
          <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[1.08]">
          <ProductArtwork
            className="transition duration-700 ease-out sm:group-hover:-rotate-3 sm:group-hover:scale-105"
            product={product}
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115]/10 via-transparent to-white/20" />
          <span
            className={`absolute left-5 top-5 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
              product.sizes.some((size) => size.available)
                ? "border border-[#2a2e36] bg-[#0f1115]/90 text-[#f4f1ea]"
                : "bg-neutral-900 text-[#f4f1ea]"
            }`}
          >
            {product.sizes.some((size) => size.available)
              ? "Available"
              : "Sold out"}
          </span>
          <span className="absolute bottom-5 right-5 flex h-11 w-11 translate-y-3 items-center justify-center rounded-full bg-[#c6ff3a] text-[#0f1115] opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowIcon className="h-4 w-4" />
          </span>
          </div>
        </Link>
        {onQuickView && (
          <button
            className="absolute bottom-5 left-5 z-20 rounded-full border border-[#2a2e36] bg-[#0f1115]/90 px-4 py-2 text-xs font-semibold opacity-100 transition sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
            onClick={() => onQuickView(product)}
            type="button"
          >
            Quick view
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c6ff3a]">
              {product.category} / {formatGender(product.gender)}
            </p>
            <h2 className="mt-2 line-clamp-2 min-h-14 text-xl font-semibold leading-7 tracking-tight">
              <Link href={href}>{product.name}</Link>
            </h2>
          </div>
          <p className="shrink-0 text-sm font-semibold">
            {formatPrice(product.price, product.currency)}
          </p>
        </div>

        <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-neutral-500">
          {product.shortDescription}
        </p>

        <div className="mt-4 flex min-h-7 flex-wrap gap-1.5">
          {product.sizes.filter((size) => size.available).slice(0, 5).map((size) => (
            <span
              className="flex h-7 min-w-7 items-center justify-center rounded-full border border-neutral-200 bg-[#181b21] px-2 text-[11px] text-neutral-500"
              key={size.id}
            >
              {size.size}
            </span>
          ))}
          {product.sizes.filter((size) => size.available).length > 5 && (
            <span className="flex h-7 items-center text-[11px] text-neutral-400">
              +{product.sizes.filter((size) => size.available).length - 5}
            </span>
          )}
        </div>

        <div className="mt-auto pt-6">
          <Link
            aria-label={`Buy now – ${product.name}`}
            className="flex min-h-12 items-center justify-between rounded-full bg-[#c6ff3a] px-5 py-3.5 text-sm font-bold text-[#0f1115] shadow-[0_10px_30px_rgba(198,255,58,0.16)] transition duration-200 hover:bg-[#d4ff6b] hover:shadow-[0_12px_34px_rgba(198,255,58,0.28)] active:scale-[0.98]"
            href={href}
          >
            Buy now
            <ArrowIcon className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
