import { describe, expect, it } from "vitest";

import {
  normalizeHomepageEyebrow,
  selectHomepageHeroProduct,
} from "@/lib/homepage";
import type { Product } from "@/types/product";

function product(id: string, featured = false): Product {
  return {
    id,
    slug: id,
    name: id,
    price: 1000,
    currency: "EGP",
    category: "Sneakers",
    gender: "Unisex",
    colors: ["Black"],
    shortDescription: "Short",
    description: "Description",
    fitNote: "True to size",
    fit: "True to size",
    width: "Standard",
    materials: "Mesh",
    care: "Wipe clean",
    merchandisingLabel: "",
    featured,
    published: true,
    archived: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    sizes: [{ id: `${id}-size`, size: "42", available: true }],
    images: [],
  };
}

describe("homepage settings", () => {
  it("uses the owner-selected hero product when it is publicly available", () => {
    const products = [product("first", true), product("selected")];
    expect(selectHomepageHeroProduct(products, "selected")?.id).toBe("selected");
  });

  it("falls back to a featured product and then the first product", () => {
    const featuredProducts = [product("first"), product("featured", true)];
    expect(selectHomepageHeroProduct(featuredProducts, "missing")?.id).toBe("featured");
    expect(selectHomepageHeroProduct([product("first")], null)?.id).toBe("first");
  });

  it("keeps the requested three-category homepage label", () => {
    expect(
      normalizeHomepageEyebrow(
        "Sneakers / Running / Shoe Care / Crease Protector",
      ),
    ).toBe("Sneakers / Running / Shoe Care");
  });
});
