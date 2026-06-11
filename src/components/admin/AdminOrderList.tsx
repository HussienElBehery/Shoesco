"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/orders";
import { createClient } from "@/lib/supabase/client";
import type { Order, OrderStatus } from "@/types/product";

export function AdminOrderList({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | OrderStatus>("All");
  const [date, setDate] = useState<"All" | "Today" | "7 days" | "30 days">("All");
  const [now] = useState(() => Date.now());

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("owner-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => router.refresh(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const dayCount = date === "Today" ? 1 : date === "7 days" ? 7 : date === "30 days" ? 30 : 0;
    return orders.filter((order) => {
      const matchesQuery =
        !normalized ||
        order.reference.toLowerCase().includes(normalized) ||
        order.customerName.toLowerCase().includes(normalized) ||
        order.customerPhone.toLowerCase().includes(normalized) ||
        order.customerEmail.toLowerCase().includes(normalized);
      const matchesStatus = status === "All" || order.status === status;
      const matchesDate =
        dayCount === 0 ||
        now - new Date(order.createdAt).getTime() <= dayCount * 24 * 60 * 60 * 1000;
      return matchesQuery && matchesStatus && matchesDate;
    });
  }, [date, now, orders, query, status]);

  return (
    <>
      <div className="mt-8 grid gap-3 rounded-[1.5rem] border border-[#2a2e36] bg-[#181b21] p-4 lg:grid-cols-[1fr_auto_auto]">
        <input
          className="h-11 rounded-xl border border-[#2a2e36] bg-[#0f1115] px-4 text-sm"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search reference, customer, phone, or email"
          type="search"
          value={query}
        />
        <select
          className="h-11 rounded-xl border border-[#2a2e36] bg-[#0f1115] px-4 text-sm"
          onChange={(event) => setStatus(event.target.value as typeof status)}
          value={status}
        >
          <option>All</option>
          {ORDER_STATUSES.map((value) => <option key={value}>{value}</option>)}
        </select>
        <select
          className="h-11 rounded-xl border border-[#2a2e36] bg-[#0f1115] px-4 text-sm"
          onChange={(event) => setDate(event.target.value as typeof date)}
          value={date}
        >
          {["All", "Today", "7 days", "30 days"].map((value) => <option key={value}>{value}</option>)}
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {filtered.map((order) => (
          <Link
            className="grid gap-4 rounded-[1.35rem] border border-[#2a2e36] bg-[#181b21] p-5 transition hover:border-[#c6ff3a]/60 sm:grid-cols-[1fr_auto] sm:items-center lg:grid-cols-[1.2fr_1fr_auto_auto]"
            href={`/admin/orders/${order.id}`}
            key={order.id}
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <strong>{order.reference}</strong>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="mt-2 text-sm text-neutral-400">
                {order.customerName} · {order.customerPhone}
              </p>
            </div>
            <div className="text-sm">
              <p>{order.items.reduce((total, item) => total + item.quantity, 0)} item(s)</p>
              <p className="mt-1 text-neutral-500">{order.deliveryArea}</p>
            </div>
            <strong>{formatPrice(order.subtotal, "EGP")}</strong>
            <time className="text-xs text-neutral-500">
              {new Intl.DateTimeFormat("en-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.createdAt))}
            </time>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-[1.5rem] border border-dashed border-[#2a2e36] px-6 py-16 text-center text-neutral-500">
            No orders match these filters.
          </div>
        )}
      </div>
    </>
  );
}
