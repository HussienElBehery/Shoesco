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
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[#fcfcfa]/90 backdrop-blur-xl">
      <Container className="relative flex h-[72px] items-center justify-between">
        <BrandMark />

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 rounded-full border border-neutral-200 bg-white/70 p-1 md:flex"
        >
          {navigation.map((item) => (
            <Link
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition hover:bg-neutral-100 hover:text-neutral-950",
                isActive(item.href)
                  ? "bg-neutral-100 text-neutral-950"
                  : "text-neutral-600",
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
          <Link
            className="rounded-full bg-neutral-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#b98a53]"
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
          className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 md:hidden"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          type="button"
        >
          <span className="space-y-1.5">
            <span
              className={cn(
                "block h-px w-4 bg-neutral-900 transition",
                isMenuOpen && "translate-y-[3.5px] rotate-45",
              )}
            />
            <span
              className={cn(
                "block h-px w-4 bg-neutral-900 transition",
                isMenuOpen && "-translate-y-[3.5px] -rotate-45",
              )}
            />
          </span>
        </button>

        {isMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="absolute left-4 right-4 top-[calc(100%+0.5rem)] rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl sm:left-auto sm:right-6 sm:w-64 md:hidden"
            id="mobile-navigation"
          >
            {navigation.map((item) => (
              <Link
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "block rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-neutral-100",
                  isActive(item.href) && "bg-neutral-100 text-neutral-950",
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
