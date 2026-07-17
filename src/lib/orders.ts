import { formatPrice } from "@/lib/format";
import type {
  Order,
  OrderReceiptItem,
  OrderItem,
  OrderStatus,
  WhatsAppOrderDetails,
  WhatsAppStatus,
} from "@/types/product";

export const ORDER_STATUSES: OrderStatus[] = [
  "New",
  "Contacted",
  "Confirmed",
  "Preparing",
  "Delivered",
  "Cancelled",
];

export const WHATSAPP_STATUSES: WhatsAppStatus[] = [
  "Awaiting message",
  "Handoff started",
  "Message received",
];

export type OrderSubmission = {
  checkoutToken: string;
  details: WhatsAppOrderDetails;
  items: {
    productId: string;
    size: string;
    color: string;
    quantity: number;
  }[];
};

export type CanonicalOrderItem = OrderReceiptItem;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9][0-9\s()-]{6,19}$/;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateOrderSubmission(value: unknown):
  | { ok: true; data: OrderSubmission }
  | { ok: false; error: string } {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "Invalid order request." };
  }
  const input = value as {
    checkoutToken?: unknown;
    details?: Record<string, unknown>;
    items?: unknown;
  };
  const checkoutToken = clean(input.checkoutToken);
  const details = input.details ?? {};
  const customerName = clean(details.customerName);
  const customerEmail = clean(details.customerEmail).toLowerCase();
  const customerPhone = clean(details.customerPhone);
  const deliveryArea = clean(details.deliveryArea);
  const deliveryAddress = clean(details.deliveryAddress);
  const notes = clean(details.notes);

  if (!uuidPattern.test(checkoutToken)) {
    return { ok: false, error: "Refresh the page and try again." };
  }
  if (customerName.length < 2 || customerName.length > 100) {
    return { ok: false, error: "Enter a valid name." };
  }
  if (
    customerEmail &&
    (!emailPattern.test(customerEmail) || customerEmail.length > 254)
  ) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (!phonePattern.test(customerPhone)) {
    return { ok: false, error: "Enter a valid phone number." };
  }
  if (deliveryArea.length < 2 || deliveryArea.length > 100) {
    return { ok: false, error: "Enter a valid delivery area." };
  }
  if (deliveryAddress.length < 5 || deliveryAddress.length > 300) {
    return { ok: false, error: "Enter a complete delivery address." };
  }
  if (notes.length > 500) {
    return { ok: false, error: "Notes must be 500 characters or fewer." };
  }
  if (!Array.isArray(input.items) || input.items.length < 1 || input.items.length > 20) {
    return { ok: false, error: "Your cart must contain between 1 and 20 items." };
  }

  const items: OrderSubmission["items"] = [];
  for (const value of input.items) {
    if (!value || typeof value !== "object") {
      return { ok: false, error: "One of the cart items is invalid." };
    }
    const item = value as Record<string, unknown>;
    const productId = clean(item.productId);
    const size = clean(item.size);
    const color = clean(item.color);
    const quantity = Number(item.quantity);
    if (
      !uuidPattern.test(productId) ||
      !size ||
      size.length > 40 ||
      !color ||
      color.length > 80 ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 20
    ) {
      return { ok: false, error: "One of the cart items is invalid." };
    }
    items.push({ productId, size, color, quantity });
  }

  return {
    ok: true,
    data: {
      checkoutToken,
      details: {
        customerName,
        customerEmail,
        customerPhone,
        deliveryArea,
        deliveryAddress,
        notes,
      },
      items,
    },
  };
}

export function createCanonicalOrderMessage({
  reference,
  items,
  subtotal,
  details,
  origin = "",
}: {
  reference: string;
  items: CanonicalOrderItem[];
  subtotal: number;
  details: WhatsAppOrderDetails;
  origin?: string;
}) {
  return [
    "Hello Shoesoco, I submitted an order request.",
    `Order reference: ${reference}`,
    "",
    ...items.map(
      (item, index) =>
        `${index + 1}. ${item.name}\nSize: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}\n${formatPrice(item.lineTotal, "EGP")}${origin ? `\n${origin}/products/${item.productId}` : ""}`,
    ),
    "",
    `Subtotal: ${formatPrice(subtotal, "EGP")}`,
    "",
    `Customer: ${details.customerName}`,
    `Email: ${details.customerEmail}`,
    `Phone: ${details.customerPhone}`,
    `Delivery area: ${details.deliveryArea}`,
    `Address: ${details.deliveryAddress}`,
    details.notes ? `Notes: ${details.notes}` : "",
    "",
    "Please confirm availability, delivery timing, and delivery cost.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function renderOrderReplyTemplate(
  template: string,
  order: Pick<Order, "customerName" | "reference" | "subtotal" | "status">,
) {
  const replacements: Record<string, string> = {
    "{customer_name}": order.customerName,
    "{order_reference}": order.reference,
    "{subtotal}": formatPrice(order.subtotal, "EGP"),
    "{status}": order.status,
  };
  return Object.entries(replacements).reduce(
    (message, [placeholder, replacement]) =>
      message.replaceAll(placeholder, replacement),
    template,
  );
}

type OrderRow = {
  id: string;
  reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_area: string;
  delivery_address: string;
  customer_notes: string;
  internal_notes: string;
  subtotal_egp: number;
  status: OrderStatus;
  whatsapp_status: WhatsAppStatus;
  created_at: string;
  updated_at: string;
  order_items?: {
    id: string;
    product_id: string | null;
    product_name: string;
    product_slug: string;
    product_image: string;
    size: string;
    color: string;
    quantity: number;
    unit_price_egp: number;
    line_total_egp: number;
  }[];
  order_events?: {
    id: string;
    event_type: string;
    description: string;
    created_at: string;
  }[];
};

export function mapOrder(row: OrderRow): Order {
  const items: OrderItem[] = (row.order_items ?? []).map((item) => ({
    id: item.id,
    productId: item.product_id,
    productName: item.product_name,
    productSlug: item.product_slug,
    productImage: item.product_image,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
    unitPrice: item.unit_price_egp,
    lineTotal: item.line_total_egp,
  }));
  return {
    id: row.id,
    reference: row.reference,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    deliveryArea: row.delivery_area,
    deliveryAddress: row.delivery_address,
    customerNotes: row.customer_notes,
    internalNotes: row.internal_notes,
    subtotal: row.subtotal_egp,
    status: row.status,
    whatsappStatus: row.whatsapp_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items,
    events: (row.order_events ?? [])
      .map((event) => ({
        id: event.id,
        eventType: event.event_type,
        description: event.description,
        createdAt: event.created_at,
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}
