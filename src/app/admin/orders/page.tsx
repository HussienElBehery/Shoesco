import { AdminOrderList } from "@/components/admin/AdminOrderList";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin";
import { getOrders } from "@/lib/order-data";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await getOrders();
  return (
    <AdminShell>
      <p className="eyebrow">Customer requests</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold">Orders</h1>
          <p className="mt-2 text-neutral-500">
            Website submissions appear here in real time before the conversation continues on WhatsApp.
          </p>
        </div>
        <span className="rounded-full border border-[#2a2e36] px-4 py-2 text-sm text-neutral-400">
          {orders.length} total
        </span>
      </div>
      <AdminOrderList orders={orders} />
    </AdminShell>
  );
}
