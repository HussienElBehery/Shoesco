import Link from "next/link";

import { BrandMark } from "@/components/ui/BrandMark";
import { Container } from "@/components/ui/Container";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { getStoreSettings } from "@/lib/catalog";

export async function Footer() {
  const settings = await getStoreSettings();
  return (
    <footer className="border-t-[6px] border-[#b78955] bg-[#161817] py-14 text-white sm:py-16">
      <Container className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <BrandMark tone="light" />
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
            <Link className="hover:text-white" href="/products">Products</Link>
            <Link className="hover:text-white" href="/about">About us</Link>
            <Link className="hover:text-white" href="/contact">Contact</Link>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Visit
          </h2>
          <div className="mt-4 space-y-2 text-sm text-neutral-300">
            <p>{settings.location}</p>
            <a
              className="block hover:text-white"
              href={`tel:+${settings.whatsappNumber}`}
            >
              {settings.whatsappDisplayNumber}
            </a>
            <a className="hover:text-white" href={`mailto:${settings.email}`}>
              {settings.email}
            </a>
          </div>
        </div>
      </Container>
      <Container className="mt-12 border-t border-white/10 pt-6">
        <p className="text-xs text-neutral-500">
          &copy; {new Date().getFullYear()} Shoesco. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
