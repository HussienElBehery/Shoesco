"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/format";
import { trackEvent } from "@/lib/analytics";
import { createWhatsAppLink } from "@/lib/whatsapp";
import type {
  EmailDelivery,
  OrderReceiptItem,
  WhatsAppOrderDetails,
} from "@/types/product";

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
  const [submittedReference, setSubmittedReference] = useState("");
  const [submittedItems, setSubmittedItems] = useState<OrderReceiptItem[]>([]);
  const [submittedSubtotal, setSubmittedSubtotal] = useState(0);
  const [siteConfirmationMessage, setSiteConfirmationMessage] = useState("");
  const [whatsappMessage, setWhatsAppMessage] = useState("");
  const [emailDelivery, setEmailDelivery] = useState<EmailDelivery>("not_requested");
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
        emailDelivery?: EmailDelivery;
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
      window.sessionStorage.removeItem(CHECKOUT_DETAILS_KEY);
      window.localStorage.removeItem(CHECKOUT_DETAILS_KEY);
      window.localStorage.removeItem(LEGACY_CHECKOUT_DETAILS_KEY);
      window.sessionStorage.removeItem(CHECKOUT_TOKEN_KEY);
      setSubmittedReference(result.reference);
      setSubmittedItems(result.orderItems);
      setSubmittedSubtotal(result.subtotal);
      setSiteConfirmationMessage(result.siteConfirmationMessage);
      setWhatsAppMessage(result.whatsappMessage);
      setEmailDelivery(result.emailDelivery ?? "not_requested");
      setSubmitting(false);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We could not save your order. Please try again.",
      );
      setSubmitting(false);
    }
  }

  if (submittedReference) {
    const whatsappLink = createWhatsAppLink({
      phoneNumber: whatsappNumber,
      message: whatsappMessage,
    });
    return (
      <div className="rounded-[2rem] bg-[#181b21] px-6 py-12 text-center text-[#f4f1ea] sm:px-10 sm:py-16">
        <p className="eyebrow !text-[#c6ff3a]">Order received</p>
        <h1 className="mt-4 text-3xl font-semibold">Thank you—your request is in.</h1>
        <p className="mx-auto mt-3 max-w-xl text-neutral-400">
          We&apos;ve saved your order. Keep your reference for any questions.
        </p>
        <div className="mx-auto mt-7 max-w-xl rounded-2xl border border-[#c6ff3a]/30 bg-[#c6ff3a]/[0.06] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">Order reference</p>
          <p className="mt-2 text-xl font-semibold tracking-wide text-[#c6ff3a]">{submittedReference}</p>
        </div>

        <section aria-label="Order confirmation message" className="mx-auto mt-6 max-w-2xl rounded-2xl border border-[#2a2e36] bg-[#0f1115] p-5 text-right text-lg leading-9 text-[#f4f1ea]" dir="rtl">
          <h2 className="sr-only">Order confirmation message</h2>
          <p>{siteConfirmationMessage}</p>
        </section>

        <section aria-label="Order summary" className="mx-auto mt-6 max-w-2xl overflow-hidden rounded-2xl border border-[#2a2e36] bg-[#0f1115] text-left">
          <div className="border-b border-[#2a2e36] px-5 py-4">
            <h2 className="font-semibold">Order summary</h2>
          </div>
          <div className="divide-y divide-[#2a2e36]">
            {submittedItems.map((item) => (
              <div className="flex items-start justify-between gap-5 px-5 py-4" key={`${item.productId}:${item.size}:${item.color}`}>
                <div>
                  <p className="font-medium">{item.quantity} × {item.name}</p>
                  <p className="mt-1 text-sm text-neutral-400">Size {item.size} · {item.color}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold">{formatPrice(item.lineTotal, "EGP")}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-[#2a2e36] px-5 py-4">
            <span className="text-sm text-neutral-400">Subtotal</span>
            <strong>{formatPrice(submittedSubtotal, "EGP")}</strong>
          </div>
        </section>

        {emailDelivery === "sent" && (
          <p className="mt-4 text-sm text-neutral-400">A receipt has been sent to your email.</p>
        )}
        {emailDelivery === "failed" && (
          <p className="mt-4 text-sm text-neutral-400">Email copy unavailable. Your order is still safely saved.</p>
        )}

        <section className="mx-auto mt-7 max-w-2xl rounded-2xl border border-[#2a2e36] bg-[#20242b] px-5 py-6">
          <h2 className="text-lg font-semibold">Complete your confirmation</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-neutral-400">
            Continue on WhatsApp to confirm the shipping cost with our team.
          </p>
        </section>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a className="inline-flex rounded-full bg-[#25d366] px-6 py-3 text-sm font-semibold text-[#0f1115]" href={whatsappLink} rel="noreferrer" target="_blank">
            Continue on WhatsApp
          </a>
          <Link className="inline-flex rounded-full border border-[#2a2e36] px-6 py-3 text-sm font-semibold" href="/products">
            Continue shopping
          </Link>
        </div>
      </div>
    );
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
        <p className="eyebrow !text-[#c6ff3a]">Confirm your order</p>
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
        <div className="mt-7 flex items-center justify-between border-t border-[#2a2e36] pt-6">
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
          className={`mt-6 flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-semibold transition ${canOrder ? "bg-[#c6ff3a] text-[#0f1115] hover:bg-[#d4ff6b]" : "pointer-events-none bg-[#181b21]/10 text-[#f4f1ea]/40"}`}
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
          Submitting saves your request and shows your receipt here. If you provide an email, we will also send you a copy. After submission, continue on WhatsApp to confirm the shipping cost. No payment is taken here.
        </p>
      </aside>
    </div>
  );
}
