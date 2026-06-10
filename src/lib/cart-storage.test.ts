import { describe, expect, it } from "vitest";

import { parseStoredCart, serializeCart } from "./cart-storage";
import type { CartItem } from "../types/product";

const item: CartItem = {
  key: "product:42:Black",
  productId: "product",
  slug: "test-product",
  name: "Test Product",
  image: "",
  size: "42",
  color: "Black",
  unitPrice: 3500,
  quantity: 1,
  availableSizes: ["41", "42"],
  availableColors: ["Black"],
};

describe("cart storage", () => {
  it("round-trips valid carts", () => {
    expect(parseStoredCart(serializeCart([item]))).toEqual([item]);
  });

  it("rejects corrupted and obsolete data", () => {
    expect(parseStoredCart("{broken")).toEqual([]);
    expect(parseStoredCart(JSON.stringify({ version: 1, items: [item] }))).toEqual([]);
  });
});
