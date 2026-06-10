import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { FeaturedProductsSection } from "@/components/sections/FeaturedProductsSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ServiceStrip } from "@/components/sections/ServiceStrip";
import { WhatsAppCtaSection } from "@/components/sections/WhatsAppCtaSection";
import { WhyChooseSection } from "@/components/sections/WhyChooseSection";
import { getStoreSettings } from "@/lib/catalog";

export default async function HomePage() {
  const settings = await getStoreSettings();
  return (
    <>
      <HeroSection settings={settings} />
      <ServiceStrip />
      <FeaturedProductsSection />
      <CategoriesSection />
      <WhyChooseSection />
      <WhatsAppCtaSection />
    </>
  );
}
