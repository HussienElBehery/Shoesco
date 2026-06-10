import { siteConfig } from "@/data/site";

type WhatsAppLinkOptions = {
  phoneNumber: string;
  message: string;
};

export function createWhatsAppLink({
  phoneNumber,
  message,
}: WhatsAppLinkOptions): string {
  const digitsOnlyPhoneNumber = phoneNumber.replace(/\D/g, "");

  return `https://wa.me/${digitsOnlyPhoneNumber}?text=${encodeURIComponent(message)}`;
}

export function createShoescoWhatsAppLink(message: string): string {
  return createWhatsAppLink({
    phoneNumber: siteConfig.whatsappNumber,
    message,
  });
}
