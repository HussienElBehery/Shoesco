"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { BrandMark } from "@/components/ui/BrandMark";
import { Container } from "@/components/ui/Container";
import { CartLink } from "@/components/cart/CartLink";
import { cn } from "@/lib/cn";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function isActive(href: string) {
    return href === "/" ? pathname === href : pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#2a2e36] bg-[#0f1115]/90 backdrop-blur-xl">
      <Container className="relative flex h-[72px] items-center justify-between">
        <BrandMark />

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 rounded-full border border-[#2a2e36] bg-[#181b21]/90 p-1 md:flex"
        >
          {navigation.map((item) => (
            <Link
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition hover:bg-[#2a2e36] hover:text-[#f4f1ea]",
                isActive(item.href)
                  ? "bg-[#2a2e36] text-[#f4f1ea]"
                  : "text-[#a7a7a7]",
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
          <Link
            className="rounded-full bg-[#c6ff3a] px-5 py-2 text-sm font-semibold text-[#0f1115] transition hover:bg-[#d4ff6b]"
            href="/products"
          >
            Explore collection
          </Link>
          <CartLink />
        </nav>

        <button
          aria-controls="mobile-navigation"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2a2e36] md:hidden"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          type="button"
        >
          <span className="space-y-1.5">
            <span
              className={cn(
                "block h-px w-4 bg-[#f4f1ea] transition",
                isMenuOpen && "translate-y-[3.5px] rotate-45",
              )}
            />
            <span
              className={cn(
                "block h-px w-4 bg-[#f4f1ea] transition",
                isMenuOpen && "-translate-y-[3.5px] -rotate-45",
              )}
            />
          </span>
        </button>

        {isMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="absolute left-4 right-4 top-[calc(100%+0.5rem)] rounded-2xl border border-[#2a2e36] bg-[#181b21] p-3 shadow-xl sm:left-auto sm:right-6 sm:w-64 md:hidden"
            id="mobile-navigation"
          >
            <form action="/products" className="mb-2 flex gap-2 border-b border-[#2a2e36] p-2 pb-4">
              <label className="sr-only" htmlFor="mobile-product-search">
                Search products
              </label>
              <input
                className="min-w-0 flex-1 rounded-full border border-[#2a2e36] bg-[#0f1115] px-4 py-2 text-sm outline-none focus:border-[#c6ff3a]"
                id="mobile-product-search"
                name="q"
                placeholder="Search products"
                type="search"
              />
              <button
                className="rounded-full bg-[#c6ff3a] px-4 py-2 text-xs font-semibold text-[#0f1115]"
                type="submit"
              >
                Search
              </button>
            </form>
            {navigation.map((item) => (
              <Link
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "block rounded-xl px-4 py-3 text-sm font-medium text-[#a7a7a7] transition hover:bg-[#2a2e36] hover:text-[#f4f1ea]",
                  isActive(item.href) && "bg-[#2a2e36] text-[#f4f1ea]",
                )}
                href={item.href}
                key={item.href}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <CartLink mobile />
          </nav>
        )}
      </Container>
    </header>
  );
}
