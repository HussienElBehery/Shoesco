import { describe, expect, it } from "vitest";

import { createCustomerWhatsAppMessage } from "@/lib/order-notifications";
import { createWhatsAppLink } from "@/lib/whatsapp";
import type { CanonicalOrderItem } from "@/lib/orders";

describe("checkout WhatsApp handoff", () => {
  it("targets the store number with the exact confirmation message", () => {
    const items: CanonicalOrderItem[] = [
      {
        productId: "123e4567-e89b-42d3-a456-426614174001",
        slug: "runner",
        name: "Runner",
        image: "",
        size: "40",
        color: "Black",
        quantity: 1,
        unitPrice: 2500,
        lineTotal: 2500,
      },
    ];
    const message = createCustomerWhatsAppMessage({
      reference: "SCO-260629-ABC123",
      items,
    });
    const link = createWhatsAppLink({
      phoneNumber: "201069368315",
      message,
    });

    expect(link).toBe(
      `https://wa.me/201069368315?text=${encodeURIComponent(message)}`,
    );
    expect(new URL(link).searchParams.get("text")).not.toContain("01154497618");
    expect(new URL(link).searchParams.get("text")).toContain("تأكيد تكلفة الشحن");
    expect(new URL(link).searchParams.get("text")).not.toContain("2500");
  });
});
