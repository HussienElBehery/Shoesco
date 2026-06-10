import { Container } from "@/components/ui/Container";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { createShoesocoWhatsAppLink } from "@/lib/whatsapp";

export function WhatsAppCtaSection() {
  const whatsappLink = createShoesocoWhatsAppLink(
    "Hello Shoesoco, I would like help choosing a pair.",
  );

  return (
    <section className="pb-16 pt-2 sm:pb-24">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-[#c6ff3a] px-6 py-12 text-[#0f1115] sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-16">
          <div className="absolute -right-16 -top-32 h-96 w-96 rounded-full border-[70px] border-[#2a2e36]/10" />
          <div className="relative">
            <p className="eyebrow !text-[#0f1115]/70">
              Personal service
            </p>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Found a pair you like? Let&apos;s get the fit right.
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-[#0f1115]/75">
              Message Shoesoco for availability, sizing guidance, and ordering
              support.
            </p>
          </div>
          <a
            className="relative mt-8 inline-flex shrink-0 items-center gap-3 rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-[#f4f1ea] transition hover:-translate-y-1 hover:bg-[#181b21] hover:text-[#f4f1ea] lg:mt-0"
            href={whatsappLink}
            rel="noreferrer"
            target="_blank"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Chat on WhatsApp
          </a>
        </div>
      </Container>
    </section>
  );
}
