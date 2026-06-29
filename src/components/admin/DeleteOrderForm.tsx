"use client";

import { deleteOrder } from "@/app/admin/actions";

export function DeleteOrderForm({
  orderId,
  reference,
}: {
  orderId: string;
  reference: string;
}) {
  return (
    <form
      action={deleteOrder}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Permanently delete order ${reference}? This cannot be undone.`,
        );
        if (!confirmed) event.preventDefault();
      }}
    >
      <input name="id" type="hidden" value={orderId} />
      <button
        className="w-full rounded-full border border-red-400/50 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/10"
        type="submit"
      >
        Delete order permanently
      </button>
      <p className="mt-3 text-xs leading-5 text-neutral-500">
        Removes this order, its items, and its history from Supabase.
      </p>
    </form>
  );
}
