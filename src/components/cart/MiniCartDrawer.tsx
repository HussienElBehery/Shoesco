"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/components/cart/CartProvider";
import { Drawer } from "@/components/ui/Drawer";
import { formatPrice } from "@/lib/format";

export function MiniCartDrawer() {
  const {
    items,
    subtotal,
    isCartOpen,
    closeCart,
    removeItem,
    updateQuantity,
  } = useCart();

  return (
    <Drawer onClose={closeCart} open={isCartOpen} title="Added to your rotation">
      <div aria-live="polite" className="p-5">
        {items.length === 0 ? (
          <p className="rounded-2xl bg-[#181b21] p-8 text-center text-neutral-500">
            Your cart is empty.
          </p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <article
                className="grid grid-cols-[88px_1fr] gap-4 rounded-2xl border border-[#2a2e36] bg-[#181b21] p-3"
                key={item.key}
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-[#20242b]">
                  {item.image && (
                    <Image
                      alt={item.name}
                      className="object-contain p-2"
                      fill
                      sizes="88px"
                      src={item.image}
                    />
                  )}
                </div>
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="mt-1 text-xs text-neutral-500">
                        Size {item.size} / {item.color}
                      </p>
                    </div>
                    <button
                      className="text-xs text-neutral-500 underline"
                      onClick={() => removeItem(item.key)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        aria-label={`Decrease ${item.name} quantity`}
                        className="h-8 w-8 rounded-full border border-[#2a2e36]"
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        type="button"
                      >
                        -
                      </button>
                      <span className="min-w-5 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        aria-label={`Increase ${item.name} quantity`}
                        className="h-8 w-8 rounded-full border border-[#2a2e36]"
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        type="button"
                      >
                        +
                      </button>
                    </div>
                    <strong className="text-sm">
                      {formatPrice(item.unitPrice * item.quantity, "EGP")}
                    </strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <div className="sticky bottom-0 border-t border-[#2a2e36] bg-[#0f1115] p-5">
        <div className="flex items-center justify-between">
          <span className="text-neutral-400">Subtotal</span>
          <strong className="text-xl">{formatPrice(subtotal, "EGP")}</strong>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            className="rounded-full border border-[#2a2e36] px-4 py-3 text-sm font-semibold"
            onClick={closeCart}
            type="button"
          >
            Continue shopping
          </button>
          <Link
            className="rounded-full bg-[#c6ff3a] px-4 py-3 text-center text-sm font-semibold text-[#0f1115]"
            href="/cart"
            onClick={closeCart}
          >
            View cart
          </Link>
        </div>
      </div>
    </Drawer>
  );
}
