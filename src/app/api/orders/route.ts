import { NextResponse } from "next/server";

import {
  createCanonicalOrderMessage,
  validateOrderSubmission,
  type CanonicalOrderItem,
} from "@/lib/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import { createWhatsAppLink } from "@/lib/whatsapp";

const attempts = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function isRateLimited(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const key = forwarded?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );
  recent.push(now);
  attempts.set(key, recent);
  return recent.length > MAX_ATTEMPTS;
}

export async function POST(request: Request) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { error: "Online ordering is not configured yet." },
      { status: 503 },
    );
  }
  if (isRateLimited(request)) {
    return NextResponse.json(
      { error: "Too many order attempts. Please wait a few minutes." },
      { status: 429 },
    );
  }

  const validation = validateOrderSubmission(
    await request.json().catch(() => null),
  );
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { checkoutToken, details, items } = validation.data;
  const supabase = createAdminClient();
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
    return NextResponse.json(
      {
        error:
          error?.message.includes("no longer available") ||
          error?.message.includes("selected")
            ? error.message
            : "We could not save your order. Please review your cart and try again.",
      },
      { status: 400 },
    );
  }

  const result = data[0] as {
    order_id: string;
    order_reference: string;
    order_subtotal: number;
    order_items: CanonicalOrderItem[];
    was_existing: boolean;
  };
  const { data: settings } = await supabase
    .from("store_settings")
    .select("whatsapp_number")
    .eq("id", 1)
    .single();
  if (!settings?.whatsapp_number) {
    return NextResponse.json(
      { error: "The store WhatsApp number is not configured." },
      { status: 503 },
    );
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
}
