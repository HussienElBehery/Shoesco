import { describe, expect, it, vi } from "vitest";

import {
  createCustomerConfirmationMessage,
  createOrderItemSummary,
  createOwnerEmailPayload,
  createWhatsAppTemplatePayload,
  normalizeWhatsAppRecipient,
  shouldSendOrderNotifications,
} from "./order-notifications";
import type { CanonicalOrderItem } from "./orders";

const details = {
  customerName: "Mona Ali",
  customerEmail: "mona@example.com",
  customerPhone: "01154497618",
  deliveryArea: "New Cairo",
  deliveryAddress: "Building 4, apartment 12",
  notes: "Call on arrival",
};

const items: CanonicalOrderItem[] = [
  {
    productId: "123e4567-e89b-42d3-a456-426614174001",
    slug: "runner",
    name: "Runner",
    image: "",
    size: "40",
    color: "Black",
    quantity: 2,
    unitPrice: 2500,
    lineTotal: 5000,
  },
];

describe("order notification payloads", () => {
  it("creates the Arabic customer confirmation message", () => {
    const message = createCustomerConfirmationMessage({
      reference: "SCO-260629-ABC123",
      items,
    });

    expect(message).toContain("مساء الخير اوردر رقم SCO-260629-ABC123");
    expect(message).toContain("2x Runner مقاس 40 لون Black");
    expect(message).toContain("01154497618");
  });

  it("builds the owner email payload with customer and order details", () => {
    vi.stubEnv("RESEND_FROM_EMAIL", "orders@shoesoco.com");
    vi.stubEnv("OWNER_NOTIFICATION_EMAIL", "Ahmed.rag789@gmail.com");

    const payload = createOwnerEmailPayload({
      reference: "SCO-260629-ABC123",
      items,
      subtotal: 5000,
      details,
      ownerMessage: "Owner-facing order details",
    });

    expect(payload).toMatchObject({
      from: "orders@shoesoco.com",
      to: "Ahmed.rag789@gmail.com",
      subject: "Shoesoco order SCO-260629-ABC123",
    });
    expect(payload.text).toContain("Mona Ali");
    expect(payload.text).toContain("mona@example.com");
    expect(payload.text).toContain("Building 4, apartment 12");

    vi.unstubAllEnvs();
  });

  it("builds a WhatsApp template payload with order variables", () => {
    vi.stubEnv("WHATSAPP_CONFIRMATION_TEMPLATE_NAME", "order_confirmation");
    vi.stubEnv("WHATSAPP_CONFIRMATION_TEMPLATE_LANGUAGE", "ar_EG");

    const payload = createWhatsAppTemplatePayload({
      reference: "SCO-260629-ABC123",
      items,
      details,
    });

    expect(payload.to).toBe("201154497618");
    expect(payload.template.name).toBe("order_confirmation");
    expect(payload.template.components[0].parameters).toEqual([
      { type: "text", text: "SCO-260629-ABC123" },
      { type: "text", text: createOrderItemSummary(items) },
    ]);

    vi.unstubAllEnvs();
  });

  it("does not send notifications for duplicate checkout tokens", () => {
    expect(shouldSendOrderNotifications(false)).toBe(true);
    expect(shouldSendOrderNotifications(true)).toBe(false);
  });

  it("normalizes Egyptian local phone numbers for WhatsApp", () => {
    expect(normalizeWhatsAppRecipient("011 5449 7618")).toBe("201154497618");
    expect(normalizeWhatsAppRecipient("+20 115 449 7618")).toBe("201154497618");
  });
});
