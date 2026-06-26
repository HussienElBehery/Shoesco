import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductPurchasePanel } from "@/components/cart/ProductPurchasePanel";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductViewTracker } from "@/components/product/ProductViewTracker";
import { SizeGuideDialog } from "@/components/product/SizeGuideDialog";
import { Container } from "@/components/ui/Container";
import { ServiceUnavailable } from "@/components/ui/ServiceUnavailable";
import { formatPrice } from "@/lib/format";
import { formatGender } from "@/lib/product-labels";
import { getProductById } from "@/lib/products";
import { getStoreSettings } from "@/lib/catalog";
import { createWhatsAppLink } from "@/lib/whatsapp";

type ProductPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id).catch(() => null);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/products/${product.id}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images[0]?.url ? [product.images[0].url] : [],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  let product;
  let settings;
  try {
    [product, settings] = await Promise.all([
      getProductById(id),
      getStoreSettings(),
    ]);
  } catch {
    return <ServiceUnavailable />;
  }
  if (!product) notFound();

  const available = product.sizes.some((size) => size.available);
  const sizeHelpLink = createWhatsAppLink({
    phoneNumber: settings.whatsappNumber,
    message: `Hello Shoesoco, I need sizing help for ${product.name}. Product: /products/${product.id}`,
  });
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((image) => image.url),
    sku: product.id,
    brand: { "@type": "Brand", name: "Shoesoco" },
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: product.price,
      availability: available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `/products/${product.id}`,
    },
  };

  return (
    <Container className="py-10 sm:py-16 lg:py-20">
      <ProductViewTracker productId={product.id} />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <ProductGallery product={product} />
        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2">
            <p className="editorial-label text-[#c6ff3a]">{product.category} / {formatGender(product.gender)}</p>
            {product.merchandisingLabel && (
              <span className="rounded-full border border-[#c6ff3a]/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#c6ff3a]">
                {product.merchandisingLabel}
              </span>
            )}
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">{product.name}</h1>
          <p className="mt-5 text-2xl font-semibold">{formatPrice(product.price, product.currency)}</p>
          <p className="mt-6 max-w-xl leading-7 text-neutral-500">{product.description}</p>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ["Availability", available ? "Available" : "Sold out"],
              ["Fit", product.fit],
              ["Width", product.width],
            ].map(([label, value]) => (
              <div className="rounded-2xl border border-[#2a2e36] bg-[#181b21] p-4" key={label}>
                <span className="text-xs text-neutral-500">{label}</span>
                <strong className="mt-1 block text-sm">{value}</strong>
              </div>
            ))}
          </div>

          <ProductPurchasePanel product={product} />

          <div className="mt-5 flex flex-wrap items-center gap-5">
            <SizeGuideDialog note={settings.sizeGuideNote} />
            <a
              className="text-sm font-semibold underline decoration-[#c6ff3a]"
              href={sizeHelpLink}
              rel="noreferrer"
              target="_blank"
            >
              Ask about sizing on WhatsApp
            </a>
          </div>

          <div className="mt-8 grid gap-3">
            {[
              ["Fit note", product.fitNote],
              ["Materials", product.materials],
              ["Care", product.care],
            ].filter(([, value]) => value).map(([label, value]) => (
              <details className="rounded-2xl border border-[#2a2e36] bg-[#181b21] p-5" key={label}>
                <summary className="cursor-pointer font-semibold">{label}</summary>
                <p className="mt-3 text-sm leading-6 text-neutral-500">{value}</p>
              </details>
            ))}
          </div>

          <div className="mt-8 grid gap-3 rounded-[1.5rem] border border-[#2a2e36] bg-[#0f1115] p-5 text-sm leading-6 text-neutral-500">
            <p><strong className="text-[#f4f1ea]">Delivery:</strong> {settings.deliveryNote}</p>
            <p><strong className="text-[#f4f1ea]">Exchange:</strong> {settings.returnsNote}</p>
            <p><strong className="text-[#f4f1ea]">Payment:</strong> No payment is taken on this website. Shoesoco confirms the order in WhatsApp.</p>
          </div>
        </div>
      </div>
    </Container>
  );
}
