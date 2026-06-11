import Link from "next/link";

import { AdminShell } from "@/components/admin/AdminShell";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { requireAdmin } from "@/lib/admin";
import { getOrders, getRecentOrderValue } from "@/lib/order-data";
import { formatPrice } from "@/lib/format";

export default async function AdminPage() {
  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-20">
        <p className="eyebrow">Owner dashboard setup</p>
        <h1 className="mt-4 text-4xl font-semibold">Connect Supabase to continue.</h1>
        <p className="mt-5 leading-7 text-neutral-600">The public catalog is running from local fallback data. Follow <code>supabase/README.md</code>, then add the project URL and anon key to <code>.env.local</code>.</p>
      </main>
    );
  }
  await requireAdmin();
  const orders = await getOrders();
  const metrics = [
    ["New orders", orders.filter((order) => order.status === "New").length],
    ["Pending replies", orders.filter((order) => order.status === "New" || order.status === "Contacted").length],
    ["Confirmed", orders.filter((order) => order.status === "Confirmed" || order.status === "Preparing").length],
    ["Recent order value", formatPrice(getRecentOrderValue(orders), "EGP")],
  ];
  return (
    <AdminShell>
      <p className="eyebrow">Owner dashboard</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
        <div><h1 className="text-4xl font-semibold">Today at Shoesoco</h1><p className="mt-2 text-neutral-500">Review customer requests and keep every order moving.</p></div>
        <Link className="rounded-full bg-[#c6ff3a] px-5 py-3 text-sm font-semibold text-[#0f1115]" href="/admin/orders">Open orders</Link>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div className="rounded-[1.5rem] border border-[#2a2e36] bg-[#181b21] p-6" key={label}><p className="text-sm text-neutral-500">{label}</p><strong className="mt-3 block text-3xl">{value}</strong></div>
        ))}
      </div>
      <section className="mt-8 rounded-[1.75rem] border border-[#2a2e36] bg-[#181b21] p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div><p className="eyebrow">Latest activity</p><h2 className="mt-2 text-2xl font-semibold">Recent orders</h2></div>
          <Link className="text-sm font-semibold underline" href="/admin/orders">View all</Link>
        </div>
        <div className="mt-5 divide-y divide-[#2a2e36]">
          {orders.slice(0, 5).map((order) => (
            <Link className="grid gap-2 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-6" href={`/admin/orders/${order.id}`} key={order.id}>
              <div><strong>{order.customerName}</strong><p className="mt-1 text-xs text-neutral-500">{order.reference} · {order.deliveryArea}</p></div>
              <span className="text-sm text-neutral-400">{order.status}</span>
              <strong className="text-sm">{formatPrice(order.subtotal, "EGP")}</strong>
            </Link>
          ))}
          {orders.length === 0 && <p className="py-10 text-center text-sm text-neutral-500">New website orders will appear here.</p>}
        </div>
      </section>
    </AdminShell>
  );
}
