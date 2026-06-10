import type { CartItem } from "@/types/product";

export const CART_STORAGE_KEY = "shoesoco-cart-v2";
export const LEGACY_CART_STORAGE_KEY = "shoe" + "sco-cart-v2";
export const CART_STORAGE_VERSION = 2;

type StoredCart = {
  version: number;
  items: CartItem[];
};

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CartItem>;
  return (
    typeof item.key === "string" &&
    typeof item.productId === "string" &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.size === "string" &&
    typeof item.color === "string" &&
    typeof item.unitPrice === "number" &&
    Number.isFinite(item.unitPrice) &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    Array.isArray(item.availableSizes) &&
    item.availableSizes.every((size) => typeof size === "string") &&
    Array.isArray(item.availableColors) &&
    item.availableColors.every((color) => typeof color === "string")
  );
}

export function parseStoredCart(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const stored = JSON.parse(raw) as StoredCart;
    if (stored.version !== CART_STORAGE_VERSION || !Array.isArray(stored.items)) {
      return [];
    }
    return stored.items.filter(isCartItem);
  } catch {
    return [];
  }
}

export function serializeCart(items: CartItem[]) {
  return JSON.stringify({ version: CART_STORAGE_VERSION, items } satisfies StoredCart);
}
