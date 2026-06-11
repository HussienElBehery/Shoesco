import type { Metadata } from "next";

import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsAppButton } from "@/components/layout/FloatingWhatsAppButton";
import { Navbar } from "@/components/layout/Navbar";
import { CartProvider } from "@/components/cart/CartProvider";
import { MiniCartDrawer } from "@/components/cart/MiniCartDrawer";
import { SiteChrome } from "@/components/layout/SiteChrome";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://shoesoco.example",
  ),
  title: {
    default: "Shoesoco",
    template: "%s | Shoesoco",
  },
  description: "Browse Shoesoco footwear and order directly through WhatsApp.",
  icons: {
    icon: "/images/Logo-transparent.png",
  },
  openGraph: {
    title: "Shoesoco",
    description: "Everyday sneakers and running shoes selected for comfort and clean design.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>
        <CartProvider>
          <MiniCartDrawer />
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
