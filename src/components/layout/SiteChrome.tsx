"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function SiteChrome({
  children,
  navbar,
  footer,
  floatingButton,
}: {
  children: ReactNode;
  navbar: ReactNode;
  footer: ReactNode;
  floatingButton: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return children;

  return (
    <>
      {navbar}
      <main className="flex-1">{children}</main>
      {footer}
      {floatingButton}
    </>
  );
}
