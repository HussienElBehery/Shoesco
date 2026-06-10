import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";

type ProductGridProps = {
  products: Product[];
  className?: string;
};

export function ProductGrid({ products, className }: ProductGridProps) {
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
        "grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
