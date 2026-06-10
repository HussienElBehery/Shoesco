import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";

type BrandMarkProps = {
  className?: string;
  tone?: "dark" | "light";
};

export function BrandMark({
  className,
  tone = "dark",
}: BrandMarkProps) {
  return (
    <Link
      aria-label="Shoesco home"
      className={cn("relative block h-10 w-36 overflow-hidden", className)}
      href="/"
    >
      <Image
        alt="Shoesco"
        className={cn(
          "object-contain object-left",
          tone === "dark" && "invert",
        )}
        fill
        priority
        sizes="144px"
        src="/images/Logo-transparent.png"
      />
    </Link>
  );
}
