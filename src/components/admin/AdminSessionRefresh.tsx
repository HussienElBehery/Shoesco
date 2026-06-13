"use client";

import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

export function AdminSessionRefresh() {
  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => undefined);
    return () => subscription.unsubscribe();
  }, []);

  return null;
}
