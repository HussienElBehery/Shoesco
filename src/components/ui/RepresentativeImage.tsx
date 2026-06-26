"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/cn";

type RepresentativeImageProps = {
  alt: string;
  className?: string;
  fallbackLabel: string;
  imageClassName?: string;
  priority?: boolean;
  sizes: string;
  src: string;
};

export function RepresentativeImage({
  alt,
  className,
  fallbackLabel,
  imageClassName,
  priority = false,
  sizes,
  src,
}: RepresentativeImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("absolute inset-0", className)}>
      {!failed ? (
        <Image
          alt={alt}
          className={cn("object-contain", imageClassName)}
          fill
          loading={priority ? "eager" : "lazy"}
          onError={() => setFailed(true)}
          priority={priority}
          sizes={sizes}
          src={src}
        />
      ) : (
        <div
          aria-label={`${fallbackLabel} representative image unavailable`}
          className="flex h-full w-full items-center justify-center rounded-[inherit] border border-[#2a2e36]/50 bg-[#181b21]/70 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#f4f1ea]/45"
          role="img"
        >
          {fallbackLabel}
        </div>
      )}
    </div>
  );
}
