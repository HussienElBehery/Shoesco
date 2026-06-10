import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";

type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <Link
      aria-label="Shoesoco home"
      className={cn("relative block h-12 w-28 sm:w-32", className)}
      href="/"
    >
      <Image
        alt="Shoesoco"
        className="object-contain object-left"
        fill
        priority
        sizes="128px"
        src="/images/Logo-transparent.png"
      />
    </Link>
  );
}
