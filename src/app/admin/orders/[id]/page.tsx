import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateOrder } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/AdminShell";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { requireAdmin } from "@/lib/admin";
import { getStoreSettings } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { getOrderById } from "@/lib/order-data";
import { ORDER_STATUSES, renderOrderReplyTemplate } from "@/lib/orders";
import { createWhatsAppLink } from "@/lib/whatsapp";

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [order, settings] = await Promise.all([
    getOrderById(id),
    getStoreSettings(),
  ]);
  if (!order) notFound();

  const reply = settings.orderReplyEnabled
    ? renderOrderReplyTemplate(settings.orderReplyTemplate, order)
    : `Hello ${order.customerName}, we are following up about your Shoesoco order ${order.reference}.`;
  const whatsappUrl = createWhatsAppLink({
    phoneNumber: order.customerPhone,
    message: reply,
  });

  return (
    <AdminShell>
      <Link className="text-sm text-neutral-400 hover:text-[#f4f1ea]" href="/admin/orders">
        ← Back to orders
      </Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">Order request</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <h1 className="text-4xl font-semibold">{order.reference}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-2 text-sm text-neutral-500">
            Submitted {new Intl.DateTimeFormat("en-EG", { dateStyle: "full", timeStyle: "short" }).format(new Date(order.createdAt))}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="rounded-full border border-[#2a2e36] px-5 py-3 text-sm font-semibold" href={`tel:${order.customerPhone}`}>Call</a>
          <a className="rounded-full border border-[#2a2e36] px-5 py-3 text-sm font-semibold" href={`mailto:${order.customerEmail}?subject=${encodeURIComponent(`Shoesoco order ${order.reference}`)}`}>Email</a>
          <a className="rounded-full bg-[#c6ff3a] px-5 py-3 text-sm font-semibold text-[#0f1115]" href={whatsappUrl} rel="noreferrer" target="_blank">Reply on WhatsApp</a>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <section className="rounded-[1.5rem] border border-[#2a2e36] bg-[#181b21] p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Items</h2>
              <strong>{formatPrice(order.subtotal, "EGP")}</strong>
            </div>
            <div className="mt-5 divide-y divide-[#2a2e36]">
              {order.items.map((item) => (
                <article className="grid grid-cols-[72px_1fr_auto] gap-4 py-4" key={item.id}>
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-[#0f1115]">
                    {item.productImage && <Image alt={item.productName} className="object-contain p-2" fill sizes="72px" src={item.productImage} />}
                  </div>
                  <div>
                    <strong className="text-sm">{item.productName}</strong>
                    <p className="mt-1 text-xs text-neutral-500">Size {item.size} · {item.color} · Qty {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold">{formatPrice(item.lineTotal, "EGP")}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[#2a2e36] bg-[#181b21] p-6">
            <h2 className="text-xl font-semibold">Order history</h2>
            <div className="mt-5 space-y-5 border-l border-[#2a2e36] pl-5">
              {order.events.map((event) => (
                <div className="relative" key={event.id}>
                  <span className="absolute -left-[1.55rem] top-1 h-2 w-2 rounded-full bg-[#c6ff3a]" />
                  <p className="text-sm">{event.description}</p>
                  <time className="mt-1 block text-xs text-neutral-500">
                    {new Intl.DateTimeFormat("en-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.createdAt))}
                  </time>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[1.5rem] border border-[#2a2e36] bg-[#181b21] p-6">
            <h2 className="text-xl font-semibold">Customer and delivery</h2>
            <dl className="mt-5 space-y-4 text-sm">
              {[
                ["Name", order.customerName],
                ["Phone", order.customerPhone],
                ["Email", order.customerEmail],
                ["Area", order.deliveryArea],
                ["Address", order.deliveryAddress],
                ["WhatsApp", order.whatsappStatus],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs uppercase tracking-wider text-neutral-500">{label}</dt>
                  <dd className="mt-1 leading-6">{value}</dd>
                </div>
              ))}
              {order.customerNotes && (
                <div>
                  <dt className="text-xs uppercase tracking-wider text-neutral-500">Customer notes</dt>
                  <dd className="mt-1 whitespace-pre-wrap leading-6">{order.customerNotes}</dd>
                </div>
              )}
            </dl>
          </section>

          <form action={updateOrder} className="rounded-[1.5rem] border border-[#2a2e36] bg-[#181b21] p-6">
            <input name="id" type="hidden" value={order.id} />
            <h2 className="text-xl font-semibold">Manage order</h2>
            <label className="mt-5 block text-sm font-semibold">
              Status
              <select className="mt-2 h-12 w-full rounded-xl border border-[#2a2e36] bg-[#0f1115] px-4" defaultValue={order.status} name="status">
                {ORDER_STATUSES.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label className="mt-5 block text-sm font-semibold">
              Internal notes
              <textarea className="mt-2 min-h-32 w-full rounded-xl border border-[#2a2e36] bg-[#0f1115] p-4" defaultValue={order.internalNotes} maxLength={1000} name="internalNotes" placeholder="Visible only to owners" />
            </label>
            <button className="mt-5 w-full rounded-full bg-[#f4f1ea] px-5 py-3 text-sm font-semibold text-[#0f1115]" type="submit">Save changes</button>
          </form>
        </div>
      </div>
    </AdminShell>
  );
}
