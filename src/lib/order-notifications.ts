import { formatPrice } from "@/lib/format";
import type { CanonicalOrderItem } from "@/lib/orders";
import type { WhatsAppOrderDetails } from "@/types/product";

const ownerEmail = "Ahmed.rag789@gmail.com";

export type OrderNotification = {
  reference: string;
  items: CanonicalOrderItem[];
  subtotal: number;
  details: WhatsAppOrderDetails;
  ownerMessage: string;
};

export function shouldSendOrderNotifications(wasExisting: boolean) {
  return !wasExisting;
}

export function createOrderItemSummary(items: CanonicalOrderItem[]) {
  const summary = items
    .map(
      (item) =>
        `${item.quantity}x ${item.name} مقاس ${item.size} لون ${item.color}`,
    )
    .join("، ");
  return summary.length > 900 ? `${summary.slice(0, 897)}...` : summary;
}

export function createCustomerConfirmationMessage({
  reference,
  items,
}: Pick<OrderNotification, "reference" | "items">) {
  return `مساء الخير اوردر رقم ${reference} حضرتك طالب ${createOrderItemSummary(items)} ببلغ حضرتك ان تأكيد اي اوردر بيكون بتحويل الشحن علي الرقم دا 01154497618`;
}

export function createOwnerEmailPayload({
  reference,
  subtotal,
  details,
  ownerMessage,
}: OrderNotification) {
  const to = process.env.OWNER_NOTIFICATION_EMAIL || ownerEmail;
  const from = process.env.RESEND_FROM_EMAIL || "";
  return {
    from,
    to,
    subject: `Shoesoco order ${reference}`,
    text: [
      `New Shoesoco order ${reference}`,
      `Subtotal: ${formatPrice(subtotal, "EGP")}`,
      "",
      `Customer: ${details.customerName}`,
      `Email: ${details.customerEmail}`,
      `Phone: ${details.customerPhone}`,
      `Delivery area: ${details.deliveryArea}`,
      `Address: ${details.deliveryAddress}`,
      details.notes ? `Notes: ${details.notes}` : "",
      "",
      ownerMessage,
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

export async function sendOwnerOrderEmail(notification: OrderNotification) {
  const apiKey = process.env.RESEND_API_KEY;
  const payload = createOwnerEmailPayload(notification);
  if (!apiKey || !payload.from || !payload.to) {
    throw new Error("Resend order notification is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Resend order notification failed with ${response.status}.`);
  }
}
