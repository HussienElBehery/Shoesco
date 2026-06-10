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
      details: { customerName: "Customer", deliveryArea: "Cairo", notes: "Call first" },
      origin: "https://example.com",
    });
    expect(message).toContain("Size: 40 | Color: White | Qty: 2");
    expect(message).toContain("Customer: Customer");
    expect(message).toContain("https://example.com/products/p");
  });
});
