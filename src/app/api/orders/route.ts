import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";

import { apiError, logServerError, readJsonBody } from "@/lib/api";
import {
  createCanonicalOrderMessage,
  validateOrderSubmission,
  type CanonicalOrderItem,
} from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import { createWhatsAppLink } from "@/lib/whatsapp";

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
    const { data: settings, error: settingsError } = await supabase
      .from("store_settings")
      .select("whatsapp_number")
      .eq("id", 1)
      .single();
    if (settingsError || !settings?.whatsapp_number) {
      throw settingsError ?? new Error("WhatsApp number is not configured.");
    }

    const origin = new URL(request.url).origin;
    const message = createCanonicalOrderMessage({
      reference: result.order_reference,
      items: result.order_items,
      subtotal: result.order_subtotal,
      details,
      origin,
    });

    return NextResponse.json({
      orderId: result.order_id,
      reference: result.order_reference,
      whatsappUrl: createWhatsAppLink({
        phoneNumber: settings.whatsapp_number,
        message,
      }),
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
