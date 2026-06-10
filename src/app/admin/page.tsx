import Link from "next/link";

import { AdminShell } from "@/components/admin/AdminShell";
import { getAllProductsForAdmin } from "@/lib/catalog";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { requireAdmin } from "@/lib/admin";

export default async function AdminPage() {
  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-20">
        <p className="eyebrow">Owner dashboard setup</p>
        <h1 className="mt-4 text-4xl font-semibold">Connect Supabase to continue.</h1>
        <p className="mt-5 leading-7 text-neutral-600">The public catalog is running from local fallback data. Follow <code>supabase/README.md</code>, then add the project URL and anon key to <code>.env.local</code>.</p>
      </main>
    );
  }
  await requireAdmin();
  const products = await getAllProductsForAdmin();
  return (
    <AdminShell>
      <p className="eyebrow">Owner dashboard</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
        <div><h1 className="text-4xl font-semibold">Catalog overview</h1><p className="mt-2 text-neutral-600">Manage what customers see and order.</p></div>
        <Link className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white" href="/admin/products/new">Add a shoe</Link>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[["Products", products.filter((p) => !p.archived).length], ["Published", products.filter((p) => p.published && !p.archived).length], ["Featured", products.filter((p) => p.featured && !p.archived).length]].map(([label, value]) => (
          <div className="rounded-2xl bg-white p-6" key={label}><p className="text-sm text-neutral-500">{label}</p><strong className="mt-3 block text-4xl">{value}</strong></div>
        ))}
      </div>
    </AdminShell>
  );
}
