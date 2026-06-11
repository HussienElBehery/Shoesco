"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";
import type { WhatsAppOrderDetails } from "@/types/product";

export function CartPageClient() {
  const { items, subtotal, updateQuantity, removeItem, clearCart, replaceVariant } = useCart();
  const [details, setDetails] = useState<WhatsAppOrderDetails>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    deliveryArea: "",
    deliveryAddress: "",
    notes: "",
  });
  const [checkoutToken, setCheckoutToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const storedToken = window.sessionStorage.getItem(
        "shoesoco-checkout-token-v1",
      );
      const token = storedToken || window.crypto.randomUUID();
      setCheckoutToken(token);
      window.sessionStorage.setItem("shoesoco-checkout-token-v1", token);
      try {
        const saved =
          window.localStorage.getItem("shoesoco-checkout-details-v1") ??
          window.localStorage.getItem("shoe" + "sco-checkout-details-v1");
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<WhatsAppOrderDetails>;
          setDetails({
            customerName: typeof parsed.customerName === "string" ? parsed.customerName : "",
            customerEmail: typeof parsed.customerEmail === "string" ? parsed.customerEmail : "",
            customerPhone: typeof parsed.customerPhone === "string" ? parsed.customerPhone : "",
            deliveryArea: typeof parsed.deliveryArea === "string" ? parsed.deliveryArea : "",
            deliveryAddress: typeof parsed.deliveryAddress === "string" ? parsed.deliveryAddress : "",
            notes: typeof parsed.notes === "string" ? parsed.notes : "",
          });
          window.localStorage.removeItem("shoe" + "sco-checkout-details-v1");
        }
      } catch {
        window.localStorage.removeItem("shoesoco-checkout-details-v1");
        window.localStorage.removeItem("shoe" + "sco-checkout-details-v1");
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "shoesoco-checkout-details-v1",
      JSON.stringify(details),
    );
  }, [details]);

  const canOrder = Boolean(
    items.length > 0 &&
    checkoutToken &&
    details.customerName.trim() &&
    details.customerEmail.trim() &&
    details.customerPhone.trim() &&
    details.deliveryArea.trim() &&
    details.deliveryAddress.trim(),
  );

  async function submitOrder() {
    if (!canOrder || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          checkoutToken,
          details,
          items: items.map((item) => ({
            productId: item.productId,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
          })),
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        whatsappUrl?: string;
      };
      if (!response.ok || !result.whatsappUrl) {
        throw new Error(result.error || "We could not save your order.");
      }
      trackEvent("whatsapp_checkout_click", {
        itemCount: items.length,
        subtotal,
      });
      clearCart();
      window.localStorage.removeItem("shoesoco-checkout-details-v1");
      window.sessionStorage.removeItem("shoesoco-checkout-token-v1");
      window.location.assign(result.whatsappUrl);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We could not save your order. Please try again.",
      );
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[2rem] bg-[#181b21] px-6 py-20 text-center">
        <h1 className="text-3xl font-semibold">Your cart is empty.</h1>
        <p className="mt-3 text-neutral-600">Choose a pair and it will appear here.</p>
        <Link className="mt-7 inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-[#f4f1ea]" href="/products">
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
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#181b21]">
                {item.image && <Image alt={item.name} className="object-contain p-3" fill sizes="120px" src={item.image} />}
              </div>
              <div>
                <Link className="font-semibold" href={`/products/${item.productId}`}>{item.name}</Link>
                <p className="mt-1 text-sm text-neutral-500">Size {item.size} / {item.color}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <label className="text-xs text-neutral-500">
                    Size
                    <select
                      className="ml-2 rounded-lg border border-[#2a2e36] bg-[#181b21] px-2 py-1 text-[#f4f1ea]"
                      onChange={(event) => replaceVariant(item.key, event.target.value, item.color)}
                      value={item.size}
                    >
                      {item.availableSizes.map((size) => <option key={size}>{size}</option>)}
                    </select>
                  </label>
                  <label className="text-xs text-neutral-500">
                    Color
                    <select
                      className="ml-2 rounded-lg border border-[#2a2e36] bg-[#181b21] px-2 py-1 text-[#f4f1ea]"
                      onChange={(event) => replaceVariant(item.key, item.size, event.target.value)}
                      value={item.color}
                    >
                      {item.availableColors.map((color) => <option key={color}>{color}</option>)}
                    </select>
                  </label>
                </div>
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

      <aside className="h-fit rounded-[2rem] bg-[#181b21] p-6 text-[#f4f1ea] sm:p-8">
        <p className="eyebrow !text-[#c6ff3a]">Complete through WhatsApp</p>
        <div className="mt-6 space-y-4">
          <label className="block text-sm">
            Name
            <input autoComplete="name" className="mt-2 h-12 w-full rounded-xl border border-[#2a2e36] bg-[#0f1115]/70 px-4 outline-none transition focus:border-[#c6ff3a]" maxLength={100} onChange={(event) => setDetails({ ...details, customerName: event.target.value })} required value={details.customerName} />
          </label>
          <label className="block text-sm">
            Email
            <input autoComplete="email" className="mt-2 h-12 w-full rounded-xl border border-[#2a2e36] bg-[#0f1115]/70 px-4 outline-none transition focus:border-[#c6ff3a]" maxLength={254} onChange={(event) => setDetails({ ...details, customerEmail: event.target.value })} required type="email" value={details.customerEmail} />
          </label>
          <label className="block text-sm">
            Phone number
            <input autoComplete="tel" className="mt-2 h-12 w-full rounded-xl border border-[#2a2e36] bg-[#0f1115]/70 px-4 outline-none transition focus:border-[#c6ff3a]" maxLength={20} onChange={(event) => setDetails({ ...details, customerPhone: event.target.value })} placeholder="+20 10 1234 5678" required type="tel" value={details.customerPhone} />
          </label>
          <label className="block text-sm">
            Delivery area
            <input autoComplete="address-level2" className="mt-2 h-12 w-full rounded-xl border border-[#2a2e36] bg-[#0f1115]/70 px-4 outline-none transition focus:border-[#c6ff3a]" maxLength={100} onChange={(event) => setDetails({ ...details, deliveryArea: event.target.value })} placeholder="District or city" required value={details.deliveryArea} />
          </label>
          <label className="block text-sm">
            Full delivery address
            <textarea autoComplete="street-address" className="mt-2 min-h-24 w-full rounded-xl border border-[#2a2e36] bg-[#0f1115]/70 p-4 outline-none transition focus:border-[#c6ff3a]" maxLength={300} onChange={(event) => setDetails({ ...details, deliveryAddress: event.target.value })} placeholder="Street, building, floor, and apartment" required value={details.deliveryAddress} />
          </label>
          <label className="block text-sm">
            Notes <span className="text-neutral-500">(optional)</span>
            <textarea className="mt-2 min-h-24 w-full rounded-xl border border-[#2a2e36] bg-[#0f1115]/70 p-4 outline-none transition focus:border-[#c6ff3a]" maxLength={500} onChange={(event) => setDetails({ ...details, notes: event.target.value })} value={details.notes} />
          </label>
        </div>
        <div className="mt-7 flex items-center justify-between border-t border-[#2a2e36] pt-6">
          <span className="text-neutral-400">Subtotal</span>
          <strong className="text-xl">{formatPrice(subtotal, "EGP")}</strong>
        </div>
        {error && (
          <p className="mt-5 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200" role="alert">
            {error}
          </p>
        )}
        <button
          className={`mt-6 flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-semibold transition ${canOrder ? "bg-[#c6ff3a] text-[#0f1115] hover:bg-[#d4ff6b]" : "pointer-events-none bg-[#181b21]/10 text-[#f4f1ea]/40"}`}
          disabled={!canOrder || submitting}
          onClick={submitOrder}
          type="button"
        >
          {submitting ? "Saving your order..." : "Save order and continue to WhatsApp"}
        </button>
        <p className="mt-4 text-xs leading-5 text-neutral-500">
          Submitting records your request with Shoesoco, then opens WhatsApp so you can send it. Availability, delivery cost, and timing are confirmed in chat. No payment is taken here.
        </p>
      </aside>
    </div>
  );
}
