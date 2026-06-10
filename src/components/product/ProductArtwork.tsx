import Image from "next/image";

import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";

type ProductArtworkProps = {
  product: Product;
  className?: string;
  priority?: boolean;
  sizes: string;
};

export function ProductArtwork({
  product,
  className,
  priority = false,
  sizes,
}: ProductArtworkProps) {
  const image = product.images[0];

  if (image) {
    return (
      <Image
        alt={image.alt || product.name}
        className={cn("object-contain p-3 sm:p-5", className)}
        fill
        priority={priority}
        sizes={sizes}
        src={image.url}
      />
    );
  }

  return (
    <div
      aria-label={`${product.name} image coming soon`}
      className="absolute inset-0 overflow-hidden bg-[#181b21]"
      role="img"
    >
      <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#181b21]/70 blur-3xl" />
      <div className="absolute bottom-[20%] left-1/2 h-8 w-2/3 -translate-x-1/2 rounded-full bg-black/10 blur-xl" />
      <div className="absolute left-1/2 top-1/2 flex h-[32%] w-[76%] -translate-x-1/2 -translate-y-1/2 -rotate-6 items-center justify-center rounded-[50%_45%_35%_55%] border border-[#2a2e36]/5 bg-[#181b21] shadow-[0_25px_45px_rgba(0,0,0,0.14)]">
        <span className="text-xs font-black uppercase tracking-[0.25em] text-neutral-300">
          Image coming soon
        </span>
      </div>
    </div>
  );
}
