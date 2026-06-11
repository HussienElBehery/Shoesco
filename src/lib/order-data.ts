import { createClient } from "@/lib/supabase/server";
import { mapOrder } from "@/lib/orders";
import type { Order } from "@/types/product";

const orderSelect = "*, order_items(*), order_events(*)";

export async function getOrders(): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapOrder);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapOrder(data) : null;
}

export function getRecentOrderValue(orders: Order[], days = 30) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return orders
    .filter((order) => new Date(order.createdAt).getTime() >= cutoff)
    .reduce((total, order) => total + order.subtotal, 0);
}
