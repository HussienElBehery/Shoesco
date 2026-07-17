import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";

import { apiError, logServerError, readJsonBody } from "@/lib/api";
import { siteConfig } from "@/data/site";
import {
  createCustomerEmailMessage,
  createCustomerSiteConfirmationMessage,
  createCustomerWhatsAppMessage,
  deliverCustomerConfirmation,
} from "@/lib/order-notifications";
import {
  validateOrderSubmission,
  type CanonicalOrderItem,
} from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/admin";

const MAXIMUM_BODY_BYTES = 16 * 1024;

function requestFingerprint(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const secret =
    process.env.RATE_LIMIT_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Rate-limit hashing is not configured.");
  return createHmac("sha256", secret).update(ip).digest("hex");
}

export async function POST(request: Request) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return apiError(
      "Online ordering is temporarily unavailable.",
      "SERVICE_UNAVAILABLE",
      503,
    );
  }

  const body = await readJsonBody(request, MAXIMUM_BODY_BYTES);
  if (!body.ok) return body.response;
  const validation = validateOrderSubmission(body.value);
  if (!validation.ok) {
    return apiError(validation.error, "INVALID_REQUEST", 400);
  }

  const { checkoutToken, details, items } = validation.data;
  try {
    const supabase = createAdminClient();
    const { data: allowed, error: rateLimitError } = await supabase.rpc(
      "consume_order_rate_limit",
      { p_client_hash: requestFingerprint(request) },
    );
    if (rateLimitError) throw rateLimitError;
    if (!allowed) {
      return apiError(
        "Too many order attempts. Please wait a few minutes.",
        "RATE_LIMITED",
        429,
      );
    }

    const { data, error } = await supabase.rpc("create_store_order", {
      p_checkout_token: checkoutToken,
      p_customer_name: details.customerName,
      p_customer_email: details.customerEmail,
      p_customer_phone: details.customerPhone,
      p_delivery_area: details.deliveryArea,
      p_delivery_address: details.deliveryAddress,
      p_customer_notes: details.notes ?? "",
      p_items: items,
    });

    if (error || !data?.[0]) {
      const inventoryMessage =
        error?.message.includes("no longer available") ||
        error?.message.includes("selected")
          ? error.message
          : null;
      if (inventoryMessage) {
        return apiError(inventoryMessage, "ORDER_FAILED", 409);
      }
      throw error ?? new Error("Order RPC returned no result.");
    }

    const result = data[0] as {
      order_id: string;
      order_reference: string;
      order_subtotal: number;
      order_items: CanonicalOrderItem[];
      was_existing: boolean;
    };
    const { data: templateSettings, error: templateError } = await supabase
      .from("store_settings")
      .select("site_confirmation_template, whatsapp_confirmation_template")
      .eq("id", 1)
      .maybeSingle();
    if (templateError) {
      logServerError("order_confirmation_templates_failed", templateError, {
        orderReference: result.order_reference,
      });
    }
    const siteConfirmationMessage = createCustomerSiteConfirmationMessage({
      reference: result.order_reference,
      items: result.order_items,
      template:
        templateSettings?.site_confirmation_template ??
        siteConfig.siteConfirmationTemplate,
    });
    const whatsappMessage = createCustomerWhatsAppMessage({
      reference: result.order_reference,
      items: result.order_items,
      template:
        templateSettings?.whatsapp_confirmation_template ??
        siteConfig.whatsappConfirmationTemplate,
    });
    const emailMessage = createCustomerEmailMessage({
      customerName: details.customerName,
      reference: result.order_reference,
      items: result.order_items,
      subtotal: result.order_subtotal,
    });
    const emailResult = await deliverCustomerConfirmation({
      recipient: details.customerEmail,
      reference: result.order_reference,
      emailMessage,
      wasExisting: result.was_existing,
    });
    if (emailResult.status === "failed") {
      logServerError("customer_confirmation_email_failed", emailResult.error, {
        orderReference: result.order_reference,
      });
    }

    return NextResponse.json({
      orderId: result.order_id,
      reference: result.order_reference,
      orderItems: result.order_items,
      subtotal: result.order_subtotal,
      siteConfirmationMessage,
      whatsappMessage,
      emailDelivery: emailResult.status,
      existing: result.was_existing,
    });
  } catch (error) {
    logServerError("order_submission_failed", error);
    return apiError(
      "We could not save your order right now. Your cart is still available.",
      "SERVICE_UNAVAILABLE",
      503,
    );
  }
}
