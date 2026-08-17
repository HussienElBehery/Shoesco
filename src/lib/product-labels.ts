import type { ProductGender } from "@/types/product";

export const PRODUCT_GENDER_OPTIONS: { value: ProductGender; label: string }[] = [
  { value: "Men", label: "Men" },
  { value: "Women", label: "Women" },
  { value: "Unisex", label: "None" },
];

export const CATALOG_GENDER_OPTIONS = PRODUCT_GENDER_OPTIONS.filter(
  (option) => option.value !== "Unisex",
);

export function formatGender(gender: ProductGender) {
  return gender === "Unisex" ? "None" : gender;
}
