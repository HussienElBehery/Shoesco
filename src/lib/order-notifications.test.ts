import { describe, expect, it } from "vitest";

import { createCustomerConfirmationMessage } from "./order-notifications";
import type { CanonicalOrderItem } from "./orders";

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

describe("order confirmation message", () => {
  it("creates the Arabic customer confirmation message with item details", () => {
    const message = createCustomerConfirmationMessage({
      reference: "SCO-260629-ABC123",
      items,
    });

    expect(message).toContain("مساء الخير اوردر رقم SCO-260629-ABC123");
    expect(message).toContain("2x Runner مقاس 40 لون Black");
    expect(message).toContain("01154497618");
  });
});
