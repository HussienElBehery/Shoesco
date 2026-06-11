import { describe, expect, it } from "vitest";

import {
  createCanonicalOrderMessage,
  renderOrderReplyTemplate,
  validateOrderSubmission,
} from "./orders";

const validSubmission = {
  checkoutToken: "123e4567-e89b-42d3-a456-426614174000",
  details: {
    customerName: "Mona Ali",
    customerEmail: "MONA@example.com",
    customerPhone: "+20 100 123 4567",
    deliveryArea: "New Cairo",
    deliveryAddress: "Building 4, apartment 12",
    notes: "Call on arrival",
  },
  items: [
    {
      productId: "123e4567-e89b-42d3-a456-426614174001",
      size: "40",
      color: "Black",
      quantity: 2,
    },
  ],
};

describe("order validation", () => {
  it("normalizes a valid guest order", () => {
    const result = validateOrderSubmission(validSubmission);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.details.customerEmail).toBe("mona@example.com");
      expect(result.data.items[0].quantity).toBe(2);
    }
  });

  it("rejects malformed contact details and cart quantities", () => {
    expect(
      validateOrderSubmission({
        ...validSubmission,
        details: { ...validSubmission.details, customerEmail: "not-an-email" },
      }).ok,
    ).toBe(false);
    expect(
      validateOrderSubmission({
        ...validSubmission,
        items: [{ ...validSubmission.items[0], quantity: 0 }],
      }).ok,
    ).toBe(false);
  });
});

describe("order messaging", () => {
  it("uses canonical prices and the saved order reference", () => {
    const message = createCanonicalOrderMessage({
      reference: "SCO-260611-ABC123",
      details: validSubmission.details,
      subtotal: 5000,
      items: [
        {
          productId: validSubmission.items[0].productId,
          slug: "runner",
          name: "Runner",
          image: "",
          size: "40",
          color: "Black",
          quantity: 2,
          unitPrice: 2500,
          lineTotal: 5000,
        },
      ],
      origin: "https://example.com",
    });
    expect(message).toContain("SCO-260611-ABC123");
    expect(message).toContain("EGP\u00a05,000");
    expect(message).toContain("Building 4, apartment 12");
  });

  it("replaces every supported owner reply placeholder", () => {
    const message = renderOrderReplyTemplate(
      "{customer_name} / {order_reference} / {subtotal} / {status}",
      {
        customerName: "Mona",
        reference: "SCO-1",
        subtotal: 3200,
        status: "Confirmed",
      },
    );
    expect(message).toBe("Mona / SCO-1 / EGP\u00a03,200 / Confirmed");
  });
});
