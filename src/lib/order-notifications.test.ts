import { beforeEach, describe, expect, it, vi } from "vitest";

const { closeMock, createTransportMock, sendMailMock, verifyMock } = vi.hoisted(() => ({
  closeMock: vi.fn(),
  createTransportMock: vi.fn(),
  sendMailMock: vi.fn(),
  verifyMock: vi.fn(),
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: createTransportMock,
  },
}));

import {
  createCustomerEmailMessage,
  createCustomerEmailPayload,
  createCustomerSiteConfirmationMessage,
  createCustomerWhatsAppMessage,
  deliverCustomerConfirmation,
  loadGmailDeliveryCredentials,
  normalizeGmailAppPassword,
  sendCustomerConfirmationEmail,
  validateConfirmationTemplate,
  verifyGmailAppPassword,
} from "./order-notifications";
import type { CanonicalOrderItem } from "./orders";

const items: CanonicalOrderItem[] = [
  {
    productId: "123e4567-e89b-42d3-a456-426614174001",
    slug: "runner",
    name: "Runner",
    image: "",
    size: "40",
    color: "Black",
    quantity: 2,
    unitPrice: 2500,
    lineTotal: 5000,
  },
];

describe("order confirmation messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createTransportMock.mockReturnValue({
      close: closeMock,
      sendMail: sendMailMock,
      verify: verifyMock,
    });
    sendMailMock.mockResolvedValue({ messageId: "test" });
    verifyMock.mockResolvedValue(true);
  });

  it("validates required confirmation placeholders and rejects unknown ones", () => {
    expect(
      validateConfirmationTemplate(
        "Order {order_reference}: {item_summary}",
        ["{order_reference}", "{item_summary}"],
      ),
    ).toEqual({ ok: true, value: "Order {order_reference}: {item_summary}" });
    expect(
      validateConfirmationTemplate("Order {order_reference}", [
        "{order_reference}",
        "{item_summary}",
      ]),
    ).toEqual({
      ok: false,
      error: "Required placeholder is missing: {item_summary}",
    });
    expect(
      validateConfirmationTemplate(
        "Order {order_reference}: {item_summary} {customer_name}",
        ["{order_reference}", "{item_summary}"],
      ),
    ).toEqual({
      ok: false,
      error: "Unsupported placeholder: {customer_name}",
    });
  });

  it("renders owner-edited site and WhatsApp templates with canonical items", () => {
    const siteMessage = createCustomerSiteConfirmationMessage({
      reference: "SCO-260629-ABC123",
      items,
      template: "مرجع {order_reference}\n{item_summary}",
    });
    const whatsappMessage = createCustomerWhatsAppMessage({
      reference: "SCO-260629-ABC123",
      items,
      template: "طلب {order_reference}\n{item_list}",
    });

    expect(siteMessage).toBe("مرجع SCO-260629-ABC123\n2x Runner مقاس 40 لون Black");
    expect(whatsappMessage).toBe(
      "طلب SCO-260629-ABC123\n• 2 × Runner\n  المقاس: 40 | اللون: Black",
    );
  });

  it("creates a concise Arabic WhatsApp draft in the buyer's voice", () => {
    const message = createCustomerWhatsAppMessage({
      reference: "SCO-260629-ABC123",
      items,
    });

    expect(message).toContain("أود استكمال تأكيد طلبي لدى Shoesoco");
    expect(message).toContain("رقم الطلب: SCO-260629-ABC123");
    expect(message).toContain("• 2 × Runner");
    expect(message).toContain("المقاس: 40 | اللون: Black");
    expect(message).toContain("مراجعة الطلب وتأكيد تكلفة الشحن");
    expect(message).not.toContain("01154497618");
    expect(message).not.toContain("Subtotal");
    expect(message).not.toContain("Address");
  });

  it("creates the original buyer-facing site confirmation with transfer instructions", () => {
    const message = createCustomerSiteConfirmationMessage({
      reference: "SCO-260629-ABC123",
      items,
    });

    expect(message).toContain("مساء الخير اوردر رقم SCO-260629-ABC123");
    expect(message).toContain("2x Runner مقاس 40 لون Black");
    expect(message).toContain("تأكيد اي اوردر بيكون بتحويل الشحن");
    expect(message).toContain("01154497618");
    expect(message).not.toContain("أود استكمال تأكيد طلبي لدى Shoesoco");
  });

  it("creates a distinct bilingual email receipt with the verified subtotal", () => {
    const siteMessage = createCustomerSiteConfirmationMessage({
      reference: "SCO-260629-ABC123",
      items,
    });
    const whatsappMessage = createCustomerWhatsAppMessage({
      reference: "SCO-260629-ABC123",
      items,
    });
    const emailMessage = createCustomerEmailMessage({
      customerName: "Mona Ali",
      reference: "SCO-260629-ABC123",
      items,
      subtotal: 5000,
    });

    expect(emailMessage).toContain("Shoesoco — Order received");
    expect(emailMessage).toContain("Hello Mona Ali,");
    expect(emailMessage).toContain("Order reference: SCO-260629-ABC123");
    expect(emailMessage).toContain("2 × Runner");
    expect(emailMessage).toContain("Subtotal: EGP\u00a05,000");
    expect(emailMessage).toContain("Shoesoco — تم استلام الطلب");
    expect(emailMessage).toContain("مساء الخير Mona Ali،");
    expect(emailMessage).toContain("الإجمالي: EGP\u00a05,000");
    expect(emailMessage).toContain("01154497618");
    expect(siteMessage).not.toBe(whatsappMessage);
    expect(siteMessage).toContain("01154497618");
    expect(whatsappMessage).not.toContain("01154497618");
    expect(emailMessage).not.toBe(whatsappMessage);
  });

  it("builds the Gmail payload from the bilingual receipt", () => {
    const emailMessage = "bilingual receipt";
    expect(
      createCustomerEmailPayload({
        recipient: "buyer@example.com",
        reference: "SCO-260629-ABC123",
        emailMessage,
      }),
    ).toEqual({
      from: "Shoesoco <Ahmed.rag789@gmail.com>",
      to: "buyer@example.com",
      subject: "Shoesoco order received — SCO-260629-ABC123",
      text: emailMessage,
    });
  });

  it("sends through the configured Gmail account without changing the receipt", async () => {
    vi.stubEnv("GMAIL_USER", "Ahmed.rag789@gmail.com");
    vi.stubEnv("GMAIL_APP_PASSWORD", "abcd efgh ijkl mnop");
    const emailMessage = "exact bilingual receipt";

    await sendCustomerConfirmationEmail({
      recipient: "buyer@example.com",
      reference: "SCO-260629-ABC123",
      emailMessage,
    });

    expect(createTransportMock).toHaveBeenCalledWith({
      service: "gmail",
      auth: { user: "Ahmed.rag789@gmail.com", pass: "abcdefghijklmnop" },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({ text: emailMessage }),
    );
    expect(closeMock).toHaveBeenCalled();
    vi.unstubAllEnvs();
  });

  it("loads encrypted Vault credentials when Vercel Gmail variables are absent", async () => {
    vi.stubEnv("GMAIL_USER", "");
    vi.stubEnv("GMAIL_APP_PASSWORD", "");
    const vaultLoader = vi.fn().mockResolvedValue({
      user: "Ahmed.rag789@gmail.com",
      pass: "abcdefghijklmnop",
    });

    await expect(loadGmailDeliveryCredentials(vaultLoader)).resolves.toEqual({
      user: "Ahmed.rag789@gmail.com",
      pass: "abcdefghijklmnop",
    });
    expect(vaultLoader).toHaveBeenCalledOnce();
    vi.unstubAllEnvs();
  });

  it("normalizes and verifies a Google app password without exposing it", async () => {
    expect(normalizeGmailAppPassword("abcd efgh ijkl mnop")).toBe(
      "abcdefghijklmnop",
    );
    await expect(
      verifyGmailAppPassword("abcd efgh ijkl mnop"),
    ).resolves.toBe("abcdefghijklmnop");
    expect(verifyMock).toHaveBeenCalledOnce();
    expect(closeMock).toHaveBeenCalledOnce();
  });

  it("reports skipped, duplicate, successful, and failed delivery outcomes", async () => {
    const base = {
      reference: "SCO-260629-ABC123",
      emailMessage: "receipt",
    };
    const send = vi.fn().mockResolvedValue(undefined);

    await expect(
      deliverCustomerConfirmation(
        { ...base, recipient: "", wasExisting: false },
        send,
      ),
    ).resolves.toEqual({ status: "not_requested" });
    await expect(
      deliverCustomerConfirmation(
        { ...base, recipient: "buyer@example.com", wasExisting: true },
        send,
      ),
    ).resolves.toEqual({ status: "already_processed" });
    await expect(
      deliverCustomerConfirmation(
        { ...base, recipient: "buyer@example.com", wasExisting: false },
        send,
      ),
    ).resolves.toEqual({ status: "sent" });

    const error = new Error("delivery failed");
    send.mockRejectedValueOnce(error);
    await expect(
      deliverCustomerConfirmation(
        { ...base, recipient: "buyer@example.com", wasExisting: false },
        send,
      ),
    ).resolves.toEqual({ status: "failed", error });
  });
});
