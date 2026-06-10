"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { CartItem } from "@/types/product";
import {
  CART_STORAGE_KEY,
  LEGACY_CART_STORAGE_KEY,
  parseStoredCart,
  serializeCart,
} from "@/lib/cart-storage";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "key" | "quantity">) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  replaceVariant: (key: string, size: string, color: string) => void;
  isHydrated: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const saved =
          window.localStorage.getItem(CART_STORAGE_KEY) ??
          window.localStorage.getItem(LEGACY_CART_STORAGE_KEY);
        setItems(parseStoredCart(saved));
        if (saved) {
          window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
        }
      } catch {
        window.localStorage.removeItem(CART_STORAGE_KEY);
      } finally {
        hydrated.current = true;
        setIsHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (hydrated.current) {
      window.localStorage.setItem(CART_STORAGE_KEY, serializeCart(items));
    }
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce(
        (total, item) => total + item.unitPrice * item.quantity,
        0,
      ),
      addItem: (item) => {
        const key = `${item.productId}:${item.size}:${item.color}`;
        setItems((current) => {
          const existing = current.find((entry) => entry.key === key);
          if (existing) {
            return current.map((entry) =>
              entry.key === key
                ? { ...entry, quantity: entry.quantity + 1 }
                : entry,
            );
          }
          return [...current, { ...item, key, quantity: 1 }];
        });
        setIsCartOpen(true);
      },
      updateQuantity: (key, quantity) =>
        setItems((current) =>
          quantity < 1
            ? current.filter((item) => item.key !== key)
            : current.map((item) =>
                item.key === key ? { ...item, quantity } : item,
              ),
        ),
      removeItem: (key) =>
        setItems((current) => current.filter((item) => item.key !== key)),
      clearCart: () => setItems([]),
      replaceVariant: (key, size, color) =>
        setItems((current) => {
          const item = current.find((entry) => entry.key === key);
          if (!item) return current;
          const nextKey = `${item.productId}:${size}:${color}`;
          const duplicate = current.find((entry) => entry.key === nextKey);
          if (duplicate && duplicate.key !== key) {
            return current
              .filter((entry) => entry.key !== key)
              .map((entry) =>
                entry.key === nextKey
                  ? { ...entry, quantity: entry.quantity + item.quantity }
                  : entry,
              );
          }
          return current.map((entry) =>
            entry.key === key ? { ...entry, key: nextKey, size, color } : entry,
          );
        }),
      isHydrated,
      isCartOpen,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
    }),
    [isCartOpen, isHydrated, items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider.");
  return value;
}
