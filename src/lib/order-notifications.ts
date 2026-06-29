import type { CanonicalOrderItem } from "@/lib/orders";

export function createOrderItemSummary(items: CanonicalOrderItem[]) {
  const summary = items
    .map(
      (item) =>
        `${item.quantity}x ${item.name} مقاس ${item.size} لون ${item.color}`,
    )
    .join("، ");
  return summary.length > 900 ? `${summary.slice(0, 897)}...` : summary;
}

export function createCustomerConfirmationMessage({
  reference,
  items,
}: {
  reference: string;
  items: CanonicalOrderItem[];
}) {
  return `مساء الخير اوردر رقم ${reference} حضرتك طالب ${createOrderItemSummary(items)} ببلغ حضرتك ان تأكيد اي اوردر بيكون بتحويل الشحن علي الرقم دا 01154497618`;
}
