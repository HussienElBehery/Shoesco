import nodemailer from "nodemailer";

import { formatPrice } from "@/lib/format";
import type { CanonicalOrderItem } from "@/lib/orders";
import { siteConfig } from "@/data/site";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EmailDelivery } from "@/types/product";

const GMAIL_SENDER = "Ahmed.rag789@gmail.com";

type GmailCredentials = { user: string; pass: string };

type TemplateValidation =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function validateConfirmationTemplate(
  value: string,
  requiredPlaceholders: string[],
): TemplateValidation {
  const template = value.trim();
  if (!template || template.length > 2000) {
    return { ok: false, error: "Confirmation templates must be between 1 and 2000 characters." };
  }
  const placeholders: string[] = template.match(/\{[^{}]+\}/g) ?? [];
  const unknown = placeholders.find(
    (placeholder) => !requiredPlaceholders.includes(placeholder),
  );
  if (unknown) {
    return { ok: false, error: `Unsupported placeholder: ${unknown}` };
  }
  const missing = requiredPlaceholders.find(
    (placeholder) => !placeholders.includes(placeholder),
  );
  if (missing) {
    return { ok: false, error: `Required placeholder is missing: ${missing}` };
  }
  return { ok: true, value: template };
}

function renderTemplate(
  template: string,
  replacements: Record<string, string>,
) {
  return Object.entries(replacements).reduce(
    (message, [placeholder, replacement]) =>
      message.replaceAll(placeholder, replacement),
    template,
  );
}

export function createCustomerSiteConfirmationMessage({
  reference,
  items,
  template = siteConfig.siteConfirmationTemplate,
}: {
  reference: string;
  items: CanonicalOrderItem[];
  template?: string;
}) {
  const itemSummary = items
    .map(
      (item) =>
        `${item.quantity}x ${item.name} مقاس ${item.size} لون ${item.color}`,
    )
    .join("، ");
  return renderTemplate(template, {
    "{order_reference}": reference,
    "{item_summary}": itemSummary,
  });
}

export function createCustomerWhatsAppMessage({
  reference,
  items,
  template = siteConfig.whatsappConfirmationTemplate,
}: {
  reference: string;
  items: CanonicalOrderItem[];
  template?: string;
}) {
  const itemLines = items.flatMap((item) => [
    `• ${item.quantity} × ${item.name}`,
    `  المقاس: ${item.size} | اللون: ${item.color}`,
  ]);
  return renderTemplate(template, {
    "{order_reference}": reference,
    "{item_list}": itemLines.join("\n"),
  });
}

export function createCustomerEmailMessage({
  customerName,
  reference,
  items,
  subtotal,
}: {
  customerName: string;
  reference: string;
  items: CanonicalOrderItem[];
  subtotal: number;
}) {
  const englishItems = items.flatMap((item, index) => [
    `${index + 1}. ${item.quantity} × ${item.name}`,
    `   Size: ${item.size} | Color: ${item.color}`,
  ]);
  const arabicItems = items.flatMap((item, index) => [
    `${index + 1}. ${item.quantity} × ${item.name}`,
    `   المقاس: ${item.size} | اللون: ${item.color}`,
  ]);
  const formattedSubtotal = formatPrice(subtotal, "EGP");
  return [
    "Shoesoco — Order received",
    "",
    `Hello ${customerName},`,
    "We received your order request.",
    `Order reference: ${reference}`,
    "",
    "Order summary:",
    ...englishItems,
    "",
    `Subtotal: ${formattedSubtotal}`,
    "To complete the order, please confirm the shipping cost with our team.",
    "Shipping transfer number: 01154497618",
    "",
    "---",
    "",
    "Shoesoco — تم استلام الطلب",
    "",
    `مساء الخير ${customerName}،`,
    "تم استلام طلبك.",
    `رقم الطلب: ${reference}`,
    "",
    "ملخص الطلب:",
    ...arabicItems,
    "",
    `الإجمالي: ${formattedSubtotal}`,
    "لاستكمال الطلب، يرجى تأكيد تكلفة الشحن مع فريقنا.",
    "رقم تحويل تكلفة الشحن: 01154497618",
  ].join("\n");
}

export function createCustomerEmailPayload({
  recipient,
  reference,
  emailMessage,
}: {
  recipient: string;
  reference: string;
  emailMessage: string;
}) {
  return {
    from: `Shoesoco <${GMAIL_SENDER}>`,
    to: recipient,
    subject: `Shoesoco order received — ${reference}`,
    text: emailMessage,
  };
}

export function normalizeGmailAppPassword(value: string) {
  return value.replace(/\s/g, "");
}

export function isGmailEnvironmentConfigured() {
  const user = process.env.GMAIL_USER?.trim() ?? "";
  const pass = normalizeGmailAppPassword(
    process.env.GMAIL_APP_PASSWORD ?? "",
  );
  return user.toLowerCase() === GMAIL_SENDER.toLowerCase() && Boolean(pass);
}

async function loadVaultGmailCredentials(): Promise<GmailCredentials | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc(
    "get_gmail_delivery_credentials",
  );
  if (error || !Array.isArray(data) || !data[0]) return null;
  const row = data[0] as { gmail_user?: string; app_password?: string };
  const user = row.gmail_user?.trim() ?? "";
  const pass = normalizeGmailAppPassword(row.app_password ?? "");
  if (user.toLowerCase() !== GMAIL_SENDER.toLowerCase() || !pass) return null;
  return { user, pass };
}

export async function loadGmailDeliveryCredentials(
  vaultLoader: () => Promise<GmailCredentials | null> =
    loadVaultGmailCredentials,
): Promise<GmailCredentials> {
  if (isGmailEnvironmentConfigured()) {
    return {
      user: process.env.GMAIL_USER!.trim(),
      pass: normalizeGmailAppPassword(process.env.GMAIL_APP_PASSWORD!),
    };
  }

  const credentials = await vaultLoader().catch(() => null);
  if (!credentials) {
    throw new Error("Gmail confirmation delivery is not configured.");
  }
  return credentials;
}

function createGmailTransporter({ user, pass }: GmailCredentials) {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

export async function verifyGmailAppPassword(value: string) {
  const pass = normalizeGmailAppPassword(value);
  if (!/^[A-Za-z0-9]{16}$/.test(pass)) {
    throw new Error("Enter the 16-character Google app password.");
  }
  const transporter = createGmailTransporter({ user: GMAIL_SENDER, pass });
  try {
    await transporter.verify();
  } catch {
    throw new Error("Google did not accept this app password.");
  } finally {
    transporter.close();
  }
  return pass;
}

export async function sendCustomerConfirmationEmail({
  recipient,
  reference,
  emailMessage,
}: {
  recipient: string;
  reference: string;
  emailMessage: string;
}) {
  const credentials = await loadGmailDeliveryCredentials();
  const transporter = createGmailTransporter(credentials);
  try {
    await transporter.sendMail(
      createCustomerEmailPayload({ recipient, reference, emailMessage }),
    );
  } catch {
    throw new Error("Gmail confirmation delivery failed.");
  } finally {
    transporter.close();
  }
}

export async function deliverCustomerConfirmation(
  {
    recipient,
    reference,
    emailMessage,
    wasExisting,
  }: {
    recipient: string;
    reference: string;
    emailMessage: string;
    wasExisting: boolean;
  },
  send: typeof sendCustomerConfirmationEmail = sendCustomerConfirmationEmail,
): Promise<{ status: EmailDelivery; error?: unknown }> {
  if (!recipient) return { status: "not_requested" };
  if (wasExisting) return { status: "already_processed" };

  try {
    await send({ recipient, reference, emailMessage });
    return { status: "sent" };
  } catch (error) {
    return { status: "failed", error };
  }
}
