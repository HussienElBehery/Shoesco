import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { HomeExperience } from "@/components/home/HomeExperience";
import { FeaturedProductsSection } from "@/components/sections/FeaturedProductsSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ServiceStrip } from "@/components/sections/ServiceStrip";
import { WhatsAppCtaSection } from "@/components/sections/WhatsAppCtaSection";
import { WhyChooseSection } from "@/components/sections/WhyChooseSection";
import { getProducts, getStoreSettings } from "@/lib/catalog";

export default async function HomePage() {
  const [settings, products] = await Promise.all([getStoreSettings(), getProducts()]);
  const featured = products.filter((product) => product.featured);
  return (
    <HomeExperience
      content={
        <>
          <ServiceStrip />
          <FeaturedProductsSection products={featured} />
          <CategoriesSection products={products} />
          <WhyChooseSection />
          <WhatsAppCtaSection />
        </>
      }
      hero={
        <HeroSection
          products={featured.length ? featured : products}
          settings={settings}
        />
      }
    />
  );
}
