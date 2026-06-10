import Link from "next/link";

import { BrandMark } from "@/components/ui/BrandMark";
import { Container } from "@/components/ui/Container";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { getStoreSettings } from "@/lib/catalog";

export async function Footer() {
  const settings = await getStoreSettings();
  return (
    <footer className="border-t-[6px] border-[#c6ff3a] bg-[#0f1115] py-14 text-[#f4f1ea] sm:py-16">
      <Container className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <BrandMark />
          <p className="mt-5 max-w-sm text-sm leading-6 text-neutral-400">
            Contemporary footwear selected for comfort, quality, and effortless
            everyday style.
          </p>
          <SocialLinks
            className="mt-6"
            instagramUrl={settings.instagramUrl}
            theme="dark"
            tiktokUrl={settings.tiktokUrl}
            whatsappNumber={settings.whatsappNumber}
          />
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Navigate
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-neutral-300">
            <Link className="hover:text-[#f4f1ea]" href="/products">Products</Link>
            <Link className="hover:text-[#f4f1ea]" href="/about">About us</Link>
            <Link className="hover:text-[#f4f1ea]" href="/contact">Contact</Link>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Visit
          </h2>
          <div className="mt-4 space-y-2 text-sm text-neutral-300">
            <p>{settings.location}</p>
            <a
              className="block hover:text-[#f4f1ea]"
              href={`tel:+${settings.whatsappNumber}`}
            >
              {settings.whatsappDisplayNumber}
            </a>
            <a className="hover:text-[#f4f1ea]" href={`mailto:${settings.email}`}>
              {settings.email}
            </a>
          </div>
        </div>
      </Container>
      <Container className="mt-12 border-t border-[#2a2e36] pt-6">
        <p className="text-xs text-neutral-500">
          &copy; {new Date().getFullYear()} Shoesoco. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
