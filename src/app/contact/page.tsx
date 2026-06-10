import type { Metadata } from "next";

import { Container } from "@/components/ui/Container";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { getStoreSettings } from "@/lib/catalog";
import { createWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Shoesco for product availability and ordering help.",
};

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const whatsappLink = createWhatsAppLink({
    phoneNumber: settings.whatsappNumber,
    message: "Hello Shoesco, I would like help choosing a pair.",
  });

  return (
    <section className="py-8 sm:py-12">
      <Container>
        <div className="grid overflow-hidden rounded-[2rem] bg-[#eeeae1] shadow-[0_25px_70px_rgba(38,33,27,0.08)] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
            <p className="eyebrow">Contact Shoesco</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">
              We&apos;re here to help.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-neutral-600 sm:text-lg">
              Ask about a product, confirm available sizes, or get help finding
              the right pair. The quickest way to reach us is WhatsApp.
            </p>

            <a
              className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#1f9d68] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#19875a]"
              href={whatsappLink}
              rel="noreferrer"
              target="_blank"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Start a WhatsApp chat
            </a>
            <div className="mt-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Follow Shoesco
              </p>
              <SocialLinks
                instagramUrl={settings.instagramUrl}
                tiktokUrl={settings.tiktokUrl}
                whatsappNumber={settings.whatsappNumber}
              />
            </div>
          </div>

          <div className="relative overflow-hidden bg-[#1a1c1b] px-6 py-12 text-white sm:px-12 sm:py-16 lg:px-14 lg:py-20">
            <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full border-[50px] border-white/[0.03]" />
            <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-[#c69a65]">
              Contact details
            </h2>
            <dl className="mt-9 space-y-8">
              <div>
                <dt className="text-xs uppercase tracking-widest text-neutral-500">
                  WhatsApp
                </dt>
                <dd className="mt-2">
                  <a
                    className="text-lg hover:text-[#c69a65]"
                    href={whatsappLink}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {settings.whatsappDisplayNumber}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-neutral-500">
                  Email
                </dt>
                <dd className="mt-2">
                  <a
                    className="text-lg hover:text-[#c69a65]"
                    href={`mailto:${settings.email}`}
                  >
                    {settings.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-neutral-500">
                  Location
                </dt>
                <dd className="mt-2 text-lg">{settings.location}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-neutral-500">
                  Support hours
                </dt>
                <dd className="mt-2 text-lg">{settings.supportHours}</dd>
              </div>
            </dl>
            <p className="mt-12 border-t border-white/10 pt-7 text-sm leading-6 text-neutral-400">
              Product purchases are arranged directly with the Shoesco team.
              This website does not process online payments.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
