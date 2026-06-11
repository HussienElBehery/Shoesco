import type { Metadata } from "next";

import { CartPageClient } from "@/components/cart/CartPageClient";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your Shoesoco selection and order through WhatsApp.",
};

export default function CartPage() {
  return (
    <Container className="py-10 sm:py-16">
      <CartPageClient />
    </Container>
  );
}
