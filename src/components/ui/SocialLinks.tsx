import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { TikTokIcon } from "@/components/ui/TikTokIcon";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { siteConfig } from "@/data/site";

type SocialLinksProps = {
  className?: string;
  theme?: "light" | "dark";
  instagramUrl?: string;
  tiktokUrl?: string;
  whatsappNumber?: string;
};

export function SocialLinks({
  className = "",
  theme = "light",
  instagramUrl = siteConfig.instagramUrl,
  tiktokUrl = siteConfig.tiktokUrl,
  whatsappNumber = siteConfig.whatsappNumber,
}: SocialLinksProps) {
  const links = [
    {
      label: "Contact Shoesoco on WhatsApp",
      href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Shoesoco, I would like to ask about your shoes.")}`,
      icon: WhatsAppIcon,
    },
    {
      label: "Follow Shoesoco on Instagram",
      href: instagramUrl,
      icon: InstagramIcon,
    },
    {
      label: "Follow Shoesoco on TikTok",
      href: tiktokUrl,
      icon: TikTokIcon,
    },
  ];

  const colors =
    theme === "dark"
      ? "border-[#2a2e36] text-neutral-300 hover:border-[#c6ff3a] hover:bg-[#181b21] hover:text-[#c6ff3a]"
      : "border-neutral-300 text-neutral-700 hover:border-neutral-950 hover:bg-neutral-950 hover:text-[#f4f1ea]";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {links.map(({ label, href, icon: Icon }) => (
        <a
          aria-label={label}
          className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${colors}`}
          href={href}
          key={label}
          rel="noreferrer"
          target="_blank"
          title={label}
        >
          <Icon className="h-5 w-5" />
        </a>
      ))}
    </div>
  );
}
