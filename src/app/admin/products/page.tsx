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
        <div>
          <p className="eyebrow">Catalog control</p>
          <h1 className="mt-3 text-4xl font-semibold">Products</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Published products appear in the customer catalog. Archived products stay hidden until restored or permanently deleted.
          </p>
        </div>
        <Link className="rounded-full bg-[#c6ff3a] px-5 py-3 text-sm font-semibold text-[#0f1115]" href="/admin/products/new">Add product</Link>
      </div>
      <AdminProductList products={products} />
    </AdminShell>
  );
}
