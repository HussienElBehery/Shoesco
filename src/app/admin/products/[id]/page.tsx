import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin";
import { getProductById } from "@/lib/catalog";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const product = await getProductById(id, true);
  if (!product) notFound();
  return <AdminShell><p className="eyebrow">Catalog</p><h1 className="mb-8 mt-3 text-4xl font-semibold">Edit {product.name}</h1><ProductForm product={product} /></AdminShell>;
}
