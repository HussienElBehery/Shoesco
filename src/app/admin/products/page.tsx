import Link from "next/link";

import { AdminShell } from "@/components/admin/AdminShell";
import { AdminProductList } from "@/components/admin/AdminProductList";
import { getAllProductsForAdmin } from "@/lib/catalog";
import { requireAdmin } from "@/lib/admin";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await getAllProductsForAdmin();
  return (
    <AdminShell>
      <div className="flex items-end justify-between gap-5">
        <div><p className="eyebrow">Catalog</p><h1 className="mt-3 text-4xl font-semibold">Products</h1></div>
        <Link className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white" href="/admin/products/new">Add product</Link>
      </div>
      <AdminProductList products={products} />
    </AdminShell>
  );
}
