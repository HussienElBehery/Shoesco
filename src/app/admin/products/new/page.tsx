import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin";

export default async function NewProductPage() {
  await requireAdmin();
  return <AdminShell><p className="eyebrow">Catalog</p><h1 className="mb-8 mt-3 text-4xl font-semibold">Add a shoe</h1><ProductForm /></AdminShell>;
}
