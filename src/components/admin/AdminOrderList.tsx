"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/orders";
import { createClient } from "@/lib/supabase/client";
import type { Order, OrderStatus } from "@/types/product";

type DateFilter = "All" | "Today" | "7 days" | "30 days";
type StatusFilter = "Needs attention" | "All" | OrderStatus;

function statusMatches(order: Order, status: StatusFilter) {
  if (status === "All") return true;
  if (status === "Needs attention") {
    return order.status === "New" || order.status === "Contacted";
  }
  return order.status === status;
}

export function AdminOrderList({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("Needs attention");
  const [date, setDate] = useState<DateFilter>("All");
  const [lastRefreshed, setLastRefreshed] = useState(() => new Date());
  const [now] = useState(() => Date.now());

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("owner-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          setLastRefreshed(new Date());
          router.refresh();
        },
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
        order.customerEmail.toLowerCase().includes(normalized) ||
        order.deliveryArea.toLowerCase().includes(normalized);
      const matchesDate =
        dayCount === 0 ||
        now - new Date(order.createdAt).getTime() <= dayCount * 24 * 60 * 60 * 1000;
      return matchesQuery && statusMatches(order, status) && matchesDate;
    });
  }, [date, now, orders, query, status]);

  const statusCounts = {
    "Needs attention": orders.filter((order) => statusMatches(order, "Needs attention")).length,
    All: orders.length,
    ...Object.fromEntries(
      ORDER_STATUSES.map((value) => [value, orders.filter((order) => order.status === value).length]),
    ),
  } as Record<StatusFilter, number>;

  return (
    <>
      <div className="mt-8 grid gap-4 rounded-[1.5rem] border border-[#2a2e36] bg-[#181b21] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(["Needs attention", "All", ...ORDER_STATUSES] as StatusFilter[]).map((value) => (
              <button
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  status === value
                    ? "bg-[#c6ff3a] text-[#0f1115]"
                    : "border border-[#2a2e36] text-neutral-400 hover:text-[#f4f1ea]"
                }`}
                key={value}
                onClick={() => setStatus(value)}
                type="button"
              >
                {value} ({statusCounts[value] ?? 0})
              </button>
            ))}
          </div>
          <button
            className="rounded-full border border-[#2a2e36] px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-[#f4f1ea]"
            onClick={() => {
              setLastRefreshed(new Date());
              router.refresh();
            }}
            type="button"
          >
            Refresh orders
          </button>
        </div>
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <input
            className="h-11 rounded-xl border border-[#2a2e36] bg-[#0f1115] px-4 text-sm"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search reference, customer, phone, email, or area"
            type="search"
            value={query}
          />
          <select
            className="h-11 rounded-xl border border-[#2a2e36] bg-[#0f1115] px-4 text-sm"
            onChange={(event) => setDate(event.target.value as DateFilter)}
            value={date}
          >
            {(["All", "Today", "7 days", "30 days"] as DateFilter[]).map((value) => <option key={value}>{value}</option>)}
          </select>
        </div>
        <p className="text-xs text-neutral-500">
          Last refreshed {new Intl.DateTimeFormat("en-EG", { timeStyle: "short" }).format(lastRefreshed)}. New Supabase order events refresh this list automatically.
        </p>
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
                {order.customerName} / {order.customerPhone}
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
