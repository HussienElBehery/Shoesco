import type { StoreSettings } from "@/types/product";

export const siteConfig: StoreSettings & {
  name: string;
  tagline: string;
  socialLinks: { instagram: string; tiktok: string };
} = {
  name: "Shoesco",
  tagline: "Everyday movement, refined.",
  whatsappNumber: "201069368315",
  whatsappDisplayNumber: "010 6936 8315",
  instagramUrl: "https://www.instagram.com/shoesoco",
  tiktokUrl: "https://www.tiktok.com/@shoesoco",
  socialLinks: {
    instagram: "https://www.instagram.com/shoesoco",
    tiktok: "https://www.tiktok.com/@shoesoco",
  },
  email: "hello@shoesco.com",
  location: "Cairo, Egypt",
  supportHours: "Saturday-Thursday, 10am-8pm",
  heroEyebrow: "Sneakers / Running",
  heroTitle: "Move well. Look effortless.",
  heroDescription:
    "Everyday sneakers and performance running shoes, selected for comfort, clean design, and the way you move.",
};
