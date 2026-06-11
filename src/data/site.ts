import type { StoreSettings } from "@/types/product";

export const siteConfig: StoreSettings & {
  name: string;
  tagline: string;
  socialLinks: { instagram: string; tiktok: string };
} = {
  name: "Shoesoco",
  tagline: "Everyday movement, refined.",
  whatsappNumber: "201069368315",
  whatsappDisplayNumber: "010 6936 8315",
  instagramUrl: "https://www.instagram.com/shoesoco",
  tiktokUrl: "https://www.tiktok.com/@shoesoco",
  socialLinks: {
    instagram: "https://www.instagram.com/shoesoco",
    tiktok: "https://www.tiktok.com/@shoesoco",
  },
  email: "hello@shoesoco.com",
  location: "Cairo, Egypt",
  supportHours: "Saturday-Thursday, 10am-8pm",
  heroEyebrow: "Sneakers / Running / Shoe Care",
  heroTitle: "Move well. Look effortless.",
  heroDescription:
    "Everyday sneakers, performance running shoes, and care essentials selected for comfort, clean design, and the way you move.",
  deliveryNote: "Delivery cost and timing are confirmed with you on WhatsApp.",
  returnsNote: "Exchange requests are reviewed before the pair is worn outdoors.",
  sizeGuideNote: "Measure your foot heel-to-toe and choose the closest EU size.",
  orderReplyEnabled: true,
  orderReplyTemplate:
    "Hello {customer_name}, thank you for your Shoesoco order {order_reference}. We received your request for {subtotal}. We will confirm stock, delivery cost, and timing shortly.",
};
