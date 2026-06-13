export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const useLocalStorefrontFallback =
  process.env.NODE_ENV !== "production" &&
  process.env.SHOESOCO_OFFLINE_DEV === "1";
