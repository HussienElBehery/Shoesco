import { formatPrice } from "@/lib/format";
import type { CartItem, WhatsAppOrderDetails } from "@/types/product";

export function createOrderMessage({
  items,
  subtotal,
  details,
  origin = "",
}: {
  items: CartItem[];
  subtotal: number;
  details: WhatsAppOrderDetails;
  origin?: string;
}) {
  return [
    "Hello Shoesoco, I would like to order:",
    "",
    ...items.map(
      (item, index) =>
        `${index + 1}. ${item.name}\nSize: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}\n${formatPrice(item.unitPrice * item.quantity, "EGP")}${origin ? `\n${origin}/products/${item.productId}` : ""}`,
    ),
    "",
    `Subtotal: ${formatPrice(subtotal, "EGP")}`,
    "",
    `Customer: ${details.customerName}`,
    `Delivery area: ${details.deliveryArea}`,
    details.notes ? `Notes: ${details.notes}` : "",
    "",
    "Please confirm availability, delivery timing, and delivery cost.",
  ]
    .filter(Boolean)
    .join("\n");
}
