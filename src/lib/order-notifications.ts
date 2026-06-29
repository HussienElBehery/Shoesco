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

export function normalizeWhatsAppRecipient(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, "");
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return `20${digits.slice(1)}`;
  return digits;
}

export function createWhatsAppTemplatePayload({
  reference,
  items,
  details,
}: Pick<OrderNotification, "reference" | "items" | "details">) {
  const templateName = process.env.WHATSAPP_CONFIRMATION_TEMPLATE_NAME || "";
  const languageCode =
    process.env.WHATSAPP_CONFIRMATION_TEMPLATE_LANGUAGE || "ar_EG";
  return {
    messaging_product: "whatsapp",
    to: normalizeWhatsAppRecipient(details.customerPhone),
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: reference },
            { type: "text", text: createOrderItemSummary(items) },
          ],
        },
      ],
    },
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

export async function sendCustomerWhatsAppConfirmation(
  notification: OrderNotification,
) {
  const token = process.env.WHATSAPP_CLOUD_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_CONFIRMATION_TEMPLATE_NAME;
  if (!token || !phoneNumberId || !templateName) {
    throw new Error("WhatsApp order confirmation is not configured.");
  }

  const response = await fetch(
    `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(createWhatsAppTemplatePayload(notification)),
    },
  );
  if (!response.ok) {
    throw new Error(
      `WhatsApp order confirmation failed with ${response.status}.`,
    );
  }
}
