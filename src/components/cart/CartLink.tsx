"use client";

import Link from "next/link";

import { useCart } from "@/components/cart/CartProvider";

export function CartLink({
  mobile = false,
}: {
  mobile?: boolean;
}) {
  const { itemCount } = useCart();

  if (mobile) {
    return (
      <Link
        className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium hover:bg-neutral-100"
        href="/cart"
      >
        Cart
        <span className="rounded-full bg-neutral-950 px-2 py-0.5 text-xs text-[#f4f1ea]">
          {itemCount}
        </span>
      </Link>
    );
  }

  return (
    <Link
      aria-label={`Shopping cart with ${itemCount} items`}
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-[#181b21] transition hover:bg-neutral-100"
      href="/cart"
    >
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path d="M5 7h14l-1 13H6L5 7Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c6ff3a] px-1 text-[10px] font-bold text-[#0f1115]">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
