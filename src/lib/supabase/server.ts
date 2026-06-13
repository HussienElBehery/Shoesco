import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createTimeoutFetch } from "@/lib/supabase/fetch";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    global: { fetch: createTimeoutFetch() },
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot always write refreshed cookies.
        }
      },
    },
  });
}
