import { NextResponse } from "next/server";

import type { AnalyticsEvent } from "@/lib/analytics";
import { isSupabaseConfigured } from "@/lib/supabase/config";
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
  if (!isSupabaseConfigured) return new NextResponse(null, { status: 204 });
  const body = (await request.json().catch(() => null)) as {
    name?: AnalyticsEvent;
    productId?: string;
    category?: string;
  } | null;
  if (!body?.name || !events.has(body.name)) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }
  const supabase = await createClient();
  await supabase.rpc("track_store_event", {
    p_event_name: body.name,
    p_product_id: body.productId ?? null,
    p_category: body.category ?? "",
  });
  return new NextResponse(null, { status: 204 });
}
