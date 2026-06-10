"use client";

export type AnalyticsEvent =
  | "product_view"
  | "filter_use"
  | "gallery_interaction"
  | "add_to_cart"
  | "size_help_click"
  | "whatsapp_checkout_click";

type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

export function trackEvent(name: AnalyticsEvent, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;
  const detail = { name, payload, timestamp: Date.now() };
  window.dispatchEvent(new CustomEvent("shoesoco:analytics", { detail }));
  void fetch("/api/analytics", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name,
      productId:
        typeof payload.productId === "string" ? payload.productId : undefined,
      category:
        typeof payload.category === "string" ? payload.category : undefined,
    }),
    keepalive: true,
  }).catch(() => undefined);
  if (process.env.NODE_ENV === "development") {
    console.info("[Shoesoco analytics]", detail);
  }
}
