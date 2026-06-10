import Link from "next/link";

import { ProductArtwork } from "@/components/product/ProductArtwork";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
  onQuickView?: (product: Product) => void;
};

export function ProductCard({ product, onQuickView }: ProductCardProps) {
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
    <article className="group flex min-w-0 h-full flex-col">
      <div className={`relative overflow-hidden rounded-[1.75rem] ${background}`}>
        <Link className="block" href={href}>
          <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[1.08]">
          <ProductArtwork
            className="transition duration-700 ease-out sm:group-hover:-rotate-3 sm:group-hover:scale-105"
            product={product}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-[#f4f1ea]/5" />
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

      <div className="flex flex-1 flex-col px-1 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c6ff3a]">
              {product.category} / {product.gender}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              <Link href={href}>{product.name}</Link>
            </h2>
          </div>
          <p className="shrink-0 text-sm font-semibold">
            {formatPrice(product.price, product.currency)}
          </p>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-500">
          {product.shortDescription}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
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

        <Link
          className="mt-auto flex items-center justify-between border-b border-neutral-300 pb-2 pt-6 text-sm font-semibold transition hover:border-neutral-950"
          href={href}
        >
          Discover this pair
          <ArrowIcon className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
