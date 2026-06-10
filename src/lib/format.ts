export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
