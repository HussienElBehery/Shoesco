import Link from "next/link";
import type { ReactNode } from "react";

import { AdminSessionRefresh } from "@/components/admin/AdminSessionRefresh";
import { BrandMark } from "@/components/ui/BrandMark";
import { signOut } from "@/app/admin/actions";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f1115]">
      <AdminSessionRefresh />
      <header className="border-b border-[#2a2e36] bg-[#181b21]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex min-w-0 flex-wrap items-center gap-5 sm:gap-8">
            <BrandMark />
            <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold sm:text-sm">
              <Link href="/admin">Overview</Link>
              <Link href="/admin/orders">Orders</Link>
              <Link href="/admin/products">Products</Link>
              <Link href="/admin/settings">Settings</Link>
              <Link href="/" target="_blank">View store</Link>
            </nav>
          </div>
          <form action={signOut}>
            <button className="rounded-full border px-4 py-2 text-xs font-semibold" type="submit">Sign out</button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8 sm:py-12">{children}</main>
    </div>
  );
}
