import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { FeaturedProductsSection } from "@/components/sections/FeaturedProductsSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ServiceStrip } from "@/components/sections/ServiceStrip";
import { WhatsAppCtaSection } from "@/components/sections/WhatsAppCtaSection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { getProducts, getReviewImages, getStoreSettings } from "@/lib/catalog";
import { selectHomepageHeroProduct } from "@/lib/homepage";
import { ServiceUnavailable } from "@/components/ui/ServiceUnavailable";

export default async function HomePage() {
  let settings;
  let products;
  try {
    [settings, products] = await Promise.all([
      getStoreSettings(),
      getProducts(),
    ]);
  } catch {
    return <ServiceUnavailable />;
  }
  // Reviews are optional homepage content. A missing migration or temporary
  // review query failure must not make the product storefront unavailable.
  const reviews = await getReviewImages().catch(() => []);
  const featured = products.filter((product) => product.featured).slice(0, 4);
  const heroProduct = selectHomepageHeroProduct(
    products,
    settings.heroFeaturedProductId,
  );
  return (
    <>
      <HeroSection product={heroProduct} settings={settings} />
      <ServiceStrip />
      <FeaturedProductsSection products={featured} />
      <CategoriesSection />
      <ReviewsSection reviews={reviews} />
      <WhatsAppCtaSection />
    </>
  );
}
