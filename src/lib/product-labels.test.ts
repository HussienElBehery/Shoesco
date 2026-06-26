import { describe, expect, it } from "vitest";

import { formatGender, PRODUCT_GENDER_OPTIONS } from "@/lib/product-labels";

describe("product gender labels", () => {
  it("displays Unisex as None while keeping the stored value", () => {
    expect(formatGender("Unisex")).toBe("None");
    expect(PRODUCT_GENDER_OPTIONS).toContainEqual({
      value: "Unisex",
      label: "None",
    });
  });

  it("keeps gender-specific labels unchanged", () => {
    expect(formatGender("Men")).toBe("Men");
    expect(formatGender("Women")).toBe("Women");
  });
});
