import { cn } from "@/lib/cn";
import type { OrderStatus } from "@/types/product";

const styles: Record<OrderStatus, string> = {
  New: "border-[#c6ff3a]/30 bg-[#c6ff3a]/10 text-[#c6ff3a]",
  Contacted: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  Confirmed: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  Preparing: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  Delivered: "border-violet-400/30 bg-violet-400/10 text-violet-300",
  Cancelled: "border-red-400/30 bg-red-400/10 text-red-300",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}
