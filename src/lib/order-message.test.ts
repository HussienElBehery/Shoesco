import { describe, expect, it } from "vitest";

import { createOrderMessage } from "./order-message";
import type { CartItem } from "../types/product";

describe("order message", () => {
  it("includes variants, quantity, customer details, and product link", () => {
    const item: CartItem = {
      key: "p:40:White",
      productId: "p",
      slug: "pair",
      name: "Everyday Pair",
      image: "",
      size: "40",
      color: "White",
      unitPrice: 3000,
      quantity: 2,
      availableSizes: ["40"],
      availableColors: ["White"],
    };
    const message = createOrderMessage({
      items: [item],
      subtotal: 6000,
      details: {
        customerName: "Customer",
        customerEmail: "customer@example.com",
        customerPhone: "+20 100 000 0000",
        deliveryArea: "Cairo",
        deliveryAddress: "12 Example Street",
        notes: "Call first",
      },
      origin: "https://example.com",
    });
    expect(message).toContain("Size: 40 | Color: White | Qty: 2");
    expect(message).toContain("Customer: Customer");
    expect(message).toContain("Email: customer@example.com");
    expect(message).toContain("Address: 12 Example Street");
    expect(message).toContain("https://example.com/products/p");
  });
});
