"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/format";
import { createWhatsAppLink } from "@/lib/whatsapp";
import type { StoreSettings, WhatsAppOrderDetails } from "@/types/product";

export function CartPageClient({ settings }: { settings: StoreSettings }) {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [details, setDetails] = useState<WhatsAppOrderDetails>({
    customerName: "",
    deliveryArea: "",
    notes: "",
  });

  const message = [
    "Hello Shoesco, I would like to order:",
    "",
    ...items.map(
      (item, index) =>
        `${index + 1}. ${item.name}\nSize: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}\n${formatPrice(item.unitPrice * item.quantity, "EGP")}\n${typeof window === "undefined" ? "" : `${window.location.origin}/products/${item.productId}`}`,
    ),
    "",
    `Subtotal: ${formatPrice(subtotal, "EGP")}`,
    "",
    `Customer: ${details.customerName}`,
    `Delivery area: ${details.deliveryArea}`,
    details.notes ? `Notes: ${details.notes}` : "",
    "",
    "Please confirm availability and delivery cost.",
  ]
    .filter(Boolean)
    .join("\n");

  const canOrder =
    items.length > 0 &&
    details.customerName.trim() &&
    details.deliveryArea.trim();

  if (items.length === 0) {
    return (
      <div className="rounded-[2rem] bg-[#eeeae1] px-6 py-20 text-center">
        <h1 className="text-3xl font-semibold">Your cart is empty.</h1>
        <p className="mt-3 text-neutral-600">Choose a pair and it will appear here.</p>
        <Link className="mt-7 inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white" href="/products">
          Browse shoes
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div>
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Your selection</p>
            <h1 className="mt-3 text-4xl font-semibold">Shopping cart</h1>
          </div>
          <button className="text-sm font-semibold underline" onClick={clearCart} type="button">
            Clear cart
          </button>
        </div>
        <div className="mt-8 divide-y divide-neutral-200">
          {items.map((item) => (
            <article className="grid grid-cols-[96px_1fr] gap-5 py-6 sm:grid-cols-[120px_1fr_auto]" key={item.key}>
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#eeeae1]">
                {item.image && <Image alt={item.name} className="object-contain p-3" fill sizes="120px" src={item.image} />}
              </div>
              <div>
                <Link className="font-semibold" href={`/products/${item.productId}`}>{item.name}</Link>
                <p className="mt-1 text-sm text-neutral-500">Size {item.size} / {item.color}</p>
                <div className="mt-4 flex items-center gap-3">
                  <button aria-label="Decrease quantity" className="h-8 w-8 rounded-full border" onClick={() => updateQuantity(item.key, item.quantity - 1)} type="button">-</button>
                  <span className="text-sm">{item.quantity}</span>
                  <button aria-label="Increase quantity" className="h-8 w-8 rounded-full border" onClick={() => updateQuantity(item.key, item.quantity + 1)} type="button">+</button>
                  <button className="ml-2 text-xs text-neutral-500 underline" onClick={() => removeItem(item.key)} type="button">Remove</button>
                </div>
              </div>
              <p className="col-start-2 font-semibold sm:col-auto">
                {formatPrice(item.unitPrice * item.quantity, "EGP")}
              </p>
            </article>
          ))}
        </div>
      </div>

      <aside className="h-fit rounded-[2rem] bg-[#1a1c1b] p-6 text-white sm:p-8">
        <p className="eyebrow !text-[#c99b68]">Complete through WhatsApp</p>
        <div className="mt-6 space-y-4">
          <label className="block text-sm">
            Name
            <input className="mt-2 h-12 w-full rounded-xl border border-white/15 bg-white/10 px-4 outline-none focus:border-white" onChange={(event) => setDetails({ ...details, customerName: event.target.value })} required value={details.customerName} />
          </label>
          <label className="block text-sm">
            Delivery area
            <input className="mt-2 h-12 w-full rounded-xl border border-white/15 bg-white/10 px-4 outline-none focus:border-white" onChange={(event) => setDetails({ ...details, deliveryArea: event.target.value })} required value={details.deliveryArea} />
          </label>
          <label className="block text-sm">
            Notes <span className="text-neutral-500">(optional)</span>
            <textarea className="mt-2 min-h-24 w-full rounded-xl border border-white/15 bg-white/10 p-4 outline-none focus:border-white" onChange={(event) => setDetails({ ...details, notes: event.target.value })} value={details.notes} />
          </label>
        </div>
        <div className="mt-7 flex items-center justify-between border-t border-white/15 pt-6">
          <span className="text-neutral-400">Subtotal</span>
          <strong className="text-xl">{formatPrice(subtotal, "EGP")}</strong>
        </div>
        <a
          className={`mt-6 flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-semibold transition ${canOrder ? "bg-[#1f9d68] text-white hover:bg-[#19875a]" : "pointer-events-none bg-white/10 text-white/40"}`}
          href={canOrder ? createWhatsAppLink({ phoneNumber: settings.whatsappNumber, message }) : undefined}
          rel="noreferrer"
          target="_blank"
        >
          Send order on WhatsApp
        </a>
        <p className="mt-4 text-xs leading-5 text-neutral-500">
          Shoesco will confirm availability and delivery cost in chat. No payment is taken on this website.
        </p>
      </aside>
    </div>
  );
}
