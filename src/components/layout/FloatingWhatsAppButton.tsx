import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { createWhatsAppLink } from "@/lib/whatsapp";
import { getStoreSettings } from "@/lib/catalog";

export async function FloatingWhatsAppButton() {
  const settings = await getStoreSettings();
  const href = createWhatsAppLink({
    phoneNumber: settings.whatsappNumber,
    message: "Hello Shoesoco, I would like to ask about your shoes.",
  });

  return (
    <a
      aria-label="Chat with Shoesoco on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 items-center gap-2 rounded-full bg-[#c6ff3a] px-4 text-sm font-semibold text-[#0f1115] shadow-[0_12px_35px_rgba(198,255,58,0.24)] transition hover:-translate-y-1 hover:bg-[#d4ff6b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6ff3a] sm:bottom-7 sm:right-7"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  );
}
