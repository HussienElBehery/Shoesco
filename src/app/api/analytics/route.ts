import { NextResponse } from "next/server";

import { apiError, logServerError, readJsonBody } from "@/lib/api";
import type { AnalyticsEvent } from "@/lib/analytics";
import {
  isSupabaseConfigured,
  useLocalStorefrontFallback,
} from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const events = new Set<AnalyticsEvent>([
  "product_view",
  "filter_use",
  "gallery_interaction",
  "add_to_cart",
  "size_help_click",
  "whatsapp_checkout_click",
]);

export async function POST(request: Request) {
  if (!isSupabaseConfigured || useLocalStorefrontFallback) {
    return new NextResponse(null, { status: 204 });
  }
  const parsed = await readJsonBody(request, 2048);
  if (!parsed.ok) return parsed.response;
  const body = parsed.value as {
    name?: AnalyticsEvent;
    productId?: string;
    category?: string;
  } | null;
  if (!body?.name || !events.has(body.name)) {
    return apiError("Invalid analytics event.", "INVALID_REQUEST", 400);
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("track_store_event", {
      p_event_name: body.name,
      p_product_id: body.productId ?? null,
      p_category: body.category ?? "",
    });
    if (error) throw error;
  } catch (error) {
    logServerError("analytics_write_failed", error, { eventName: body.name });
  }
  return new NextResponse(null, { status: 204 });
}
