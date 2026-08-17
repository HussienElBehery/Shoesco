"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";
import { createWhatsAppLink } from "@/lib/whatsapp";
import { CART_STORAGE_KEY } from "@/lib/cart-storage";
import type { OrderReceiptItem, WhatsAppOrderDetails } from "@/types/product";

const CHECKOUT_DETAILS_KEY = "shoesoco-checkout-details-v1";
const LEGACY_CHECKOUT_DETAILS_KEY = "shoe" + "sco-checkout-details-v1";
const CHECKOUT_TOKEN_KEY = "shoesoco-checkout-token-v1";

export function CartPageClient({ whatsappNumber }: { whatsappNumber: string }) {
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
  const [serviceStatus, setServiceStatus] = useState<
    "checking" | "ready" | "unavailable"
  >("checking");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const storedToken = window.sessionStorage.getItem(
        CHECKOUT_TOKEN_KEY,
      );
      const token = storedToken || window.crypto.randomUUID();
      setCheckoutToken(token);
      window.sessionStorage.setItem(CHECKOUT_TOKEN_KEY, token);
      try {
        const saved = window.sessionStorage.getItem(CHECKOUT_DETAILS_KEY);
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
        }
        window.localStorage.removeItem(CHECKOUT_DETAILS_KEY);
        window.localStorage.removeItem(LEGACY_CHECKOUT_DETAILS_KEY);
      } catch {
        window.sessionStorage.removeItem(CHECKOUT_DETAILS_KEY);
        window.localStorage.removeItem(CHECKOUT_DETAILS_KEY);
        window.localStorage.removeItem(LEGACY_CHECKOUT_DETAILS_KEY);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/health", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) =>
        setServiceStatus(response.ok ? "ready" : "unavailable"),
      )
      .catch((healthError: unknown) => {
        if (
          !(healthError instanceof DOMException) ||
          healthError.name !== "AbortError"
        ) {
          setServiceStatus("unavailable");
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        CHECKOUT_DETAILS_KEY,
        JSON.stringify(details),
      );
    } catch {
      // Checkout remains usable when browser storage is unavailable.
    }
  }, [details]);

  const canOrder = Boolean(
    items.length > 0 &&
    checkoutToken &&
    details.customerName.trim() &&
    details.customerPhone.trim() &&
    details.deliveryArea.trim() &&
    details.deliveryAddress.trim() &&
    serviceStatus === "ready",
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
        code?: string;
        reference?: string;
        orderItems?: OrderReceiptItem[];
        subtotal?: number;
        siteConfirmationMessage?: string;
        whatsappMessage?: string;
      };
      if (
        !response.ok ||
        !result.reference ||
        !Array.isArray(result.orderItems) ||
        typeof result.subtotal !== "number" ||
        !result.siteConfirmationMessage ||
        !result.whatsappMessage
      ) {
        throw new Error(result.error || "We could not save your order.");
      }
      trackEvent("order_submit", {
        itemCount: items.length,
        subtotal,
      });
      clearCart();
      window.sessionStorage.removeItem(CART_STORAGE_KEY);
      window.sessionStorage.removeItem(CHECKOUT_DETAILS_KEY);
      window.localStorage.removeItem(CHECKOUT_DETAILS_KEY);
      window.localStorage.removeItem(LEGACY_CHECKOUT_DETAILS_KEY);
      window.sessionStorage.removeItem(CHECKOUT_TOKEN_KEY);
      const whatsappLink = createWhatsAppLink({
        phoneNumber: whatsappNumber,
        message: result.whatsappMessage,
      });
      window.location.assign(whatsappLink);
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
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
      <div className="min-w-0 rounded-[2rem] border border-[#2a2e36] bg-[#181b21] p-5 shadow-[0_20px_65px_rgba(0,0,0,0.18)] sm:p-7">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Your selection</p>
            <h1 className="mt-3 text-4xl font-semibold">Shopping cart</h1>
          </div>
          <button className="text-sm font-semibold underline" onClick={clearCart} type="button">
            Clear cart
          </button>
        </div>
        <div className="mt-8 space-y-3">
          {items.map((item) => (
            <article className="grid grid-cols-[88px_1fr] gap-4 rounded-[1.5rem] border border-[#2a2e36] bg-[#0f1115] p-4 sm:grid-cols-[112px_1fr_auto] sm:gap-5" key={item.key}>
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f4f1ea]">
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
                  <button aria-label="Decrease quantity" className="h-9 w-9 rounded-full border border-[#3a3f49] transition hover:border-[#c6ff3a] hover:text-[#c6ff3a]" onClick={() => updateQuantity(item.key, item.quantity - 1)} type="button">-</button>
                  <span className="text-sm">{item.quantity}</span>
                  <button aria-label="Increase quantity" className="h-9 w-9 rounded-full border border-[#3a3f49] transition hover:border-[#c6ff3a] hover:text-[#c6ff3a]" onClick={() => updateQuantity(item.key, item.quantity + 1)} type="button">+</button>
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

      <aside className="h-fit rounded-[2rem] border border-[#c6ff3a]/25 bg-[radial-gradient(circle_at_top_right,rgba(198,255,58,0.09),transparent_30%),#181b21] p-6 text-[#f4f1ea] shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8 lg:sticky lg:top-24">
        <p className="eyebrow !text-[#c6ff3a]">Confirm your order</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Delivery details</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-400">We’ll save your request, then open WhatsApp with your order message ready to send.</p>
        <div className="mt-6 space-y-4">
          <label className="block text-sm">
            Name
            <input autoComplete="name" className="mt-2 h-12 w-full rounded-xl border border-[#2a2e36] bg-[#0f1115]/70 px-4 outline-none transition focus:border-[#c6ff3a]" maxLength={100} onChange={(event) => setDetails({ ...details, customerName: event.target.value })} required value={details.customerName} />
          </label>
          <label className="block text-sm">
            Email <span className="text-neutral-500">(optional)</span>
            <input autoComplete="email" className="mt-2 h-12 w-full rounded-xl border border-[#2a2e36] bg-[#0f1115]/70 px-4 outline-none transition focus:border-[#c6ff3a]" maxLength={254} onChange={(event) => setDetails({ ...details, customerEmail: event.target.value })} type="email" value={details.customerEmail} />
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
        <div className="mt-7 flex items-center justify-between rounded-2xl border border-[#2a2e36] bg-[#0f1115]/70 px-5 py-4">
          <span className="text-neutral-400">Subtotal</span>
          <strong className="text-xl">{formatPrice(subtotal, "EGP")}</strong>
        </div>
        {error && (
          <p className="mt-5 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200" role="alert">
            {error}
          </p>
        )}
        {serviceStatus === "unavailable" && !error && (
          <p className="mt-5 rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100" role="status">
            Online ordering is temporarily unavailable. Your cart is saved for
            this browser session, so please try again shortly or use the contact page.
          </p>
        )}
        <button
          className={`mt-6 flex min-h-14 w-full items-center justify-center rounded-full px-6 py-4 text-base font-bold transition ${canOrder ? "bg-[#c6ff3a] text-[#0f1115] shadow-[0_12px_35px_rgba(198,255,58,0.22)] hover:bg-[#d4ff6b] hover:shadow-[0_14px_40px_rgba(198,255,58,0.32)] active:scale-[0.99]" : "cursor-not-allowed bg-[#2a2e36] text-neutral-500"}`}
          disabled={!canOrder || submitting}
          onClick={submitOrder}
          type="button"
        >
          {submitting
            ? "Saving your order..."
            : serviceStatus === "checking"
              ? "Checking ordering availability..."
              : "Submit order request"}
        </button>
        <p className="mt-4 text-xs leading-5 text-neutral-500">
          Submitting saves your request and opens WhatsApp automatically to confirm shipping cost. If you provide an email, we will also send you a copy. No payment is taken here.
        </p>
      </aside>
    </div>
  );
}
