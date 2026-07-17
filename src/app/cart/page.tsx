import type { Metadata } from "next";

import { CartPageClient } from "@/components/cart/CartPageClient";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/data/site";
import { getStoreSettings } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your Shoesoco selection and order through WhatsApp.",
};

export default async function CartPage() {
  const settings = await getStoreSettings().catch(() => siteConfig);
  return (
    <Container className="py-10 sm:py-16">
      <CartPageClient whatsappNumber={settings.whatsappNumber} />
    </Container>
  );
}
