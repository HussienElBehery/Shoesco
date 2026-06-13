import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";

type ProductGridProps = {
  products: Product[];
  className?: string;
  onQuickView?: (product: Product) => void;
};

export function ProductGrid({ products, className, onQuickView }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className={cn("text-neutral-600", className)}>
        Products will be added soon.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "grid min-w-0 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          onQuickView={onQuickView}
          priority={index < 3}
          product={product}
        />
      ))}
    </div>
  );
}
