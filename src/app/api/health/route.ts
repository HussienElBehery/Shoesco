import { apiError, logServerError } from "@/lib/api";
import {
  isSupabaseConfigured,
  useLocalStorefrontFallback,
} from "@/lib/supabase/config";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (
    !isSupabaseConfigured ||
    useLocalStorefrontFallback ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return apiError(
      "The application is not fully configured.",
      "SERVICE_UNAVAILABLE",
      503,
    );
  }

  try {
    const { error } = await createAdminClient()
      .from("store_settings")
      .select("id")
      .eq("id", 1)
      .single();
    if (error) throw error;
    return Response.json(
      { status: "ready" },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    logServerError("health_check_failed", error);
    return apiError(
      "A required service is unavailable.",
      "SERVICE_UNAVAILABLE",
      503,
    );
  }
}
