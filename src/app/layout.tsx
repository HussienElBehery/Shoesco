import type { Metadata } from "next";

import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsAppButton } from "@/components/layout/FloatingWhatsAppButton";
import { Navbar } from "@/components/layout/Navbar";
import { CartProvider } from "@/components/cart/CartProvider";
import { SiteChrome } from "@/components/layout/SiteChrome";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Shoesco",
    template: "%s | Shoesco",
  },
  description: "Browse Shoesco footwear and order directly through WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <SiteChrome
            floatingButton={<FloatingWhatsAppButton />}
            footer={<Footer />}
            navbar={<Navbar />}
          >
            {children}
          </SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
