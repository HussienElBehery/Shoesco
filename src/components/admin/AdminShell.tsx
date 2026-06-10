import Link from "next/link";
import type { ReactNode } from "react";

import { BrandMark } from "@/components/ui/BrandMark";
import { signOut } from "@/app/admin/actions";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f2f0ea]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-8">
            <BrandMark />
            <nav className="hidden gap-5 text-sm font-semibold sm:flex">
              <Link href="/admin">Overview</Link>
              <Link href="/admin/products">Products</Link>
              <Link href="/admin/settings">Store settings</Link>
              <Link href="/" target="_blank">View website</Link>
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
