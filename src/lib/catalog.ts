import { cache } from "react";

import { products as fallbackProducts } from "@/data/products";
import { siteConfig } from "@/data/site";
import {
  isSupabaseConfigured,
  useLocalStorefrontFallback,
} from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Product, ReviewImage, StoreSettings } from "@/types/product";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  price_egp: number;
  category: Product["category"];
  gender: Product["gender"];
  colors: string[];
  short_description: string;
  description: string;
  fit_note: string | null;
  fit: Product["fit"] | null;
  width: Product["width"] | null;
  materials: string | null;
  care: string | null;
  merchandising_label: string | null;
  featured: boolean;
  published: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
  product_sizes: { id: string; size: string; available: boolean }[];
  product_images: {
    id: string;
    storage_path: string;
    public_url: string;
    alt_text: string;
    position: number;
  }[];
};

export class StorefrontUnavailableError extends Error {
  constructor() {
    super("The storefront data service is unavailable.");
    this.name = "StorefrontUnavailableError";
  }
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: row.price_egp,
    currency: "EGP",
    category: row.category,
    gender: row.gender,
    colors: row.colors,
    shortDescription: row.short_description,
    description: row.description,
    fitNote: row.fit_note ?? "Fits true to size for most feet.",
    fit: row.fit ?? "True to size",
    width: row.width ?? "Standard",
    materials: row.materials ?? "",
    care: row.care ?? "",
    merchandisingLabel: row.merchandising_label ?? "",
    featured: row.featured,
    published: row.published,
    archived: row.archived,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sizes: row.product_sizes.sort((a, b) =>
      a.size.localeCompare(b.size, undefined, { numeric: true }),
    ),
    images: row.product_images
      .sort((a, b) => a.position - b.position)
      .map((image) => ({
        id: image.id,
        path: image.storage_path,
        url: image.public_url,
        alt: image.alt_text,
        position: image.position,
      })),
  };
}

export const getProducts = cache(async (): Promise<Product[]> => {
  if (!isSupabaseConfigured || useLocalStorefrontFallback) {
    return fallbackProducts;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_sizes(*), product_images(*)")
    .eq("published", true)
    .eq("archived", false)
    .order("created_at", { ascending: false });

  if (error) throw new StorefrontUnavailableError();
  return (data as ProductRow[]).map(mapProduct);
});

export const getAllProductsForAdmin = cache(async (): Promise<Product[]> => {
  if (!isSupabaseConfigured) return fallbackProducts;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_sizes(*), product_images(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ProductRow[]).map(mapProduct);
});

export async function getProductById(id: string, includeHidden = false) {
  const source = includeHidden ? await getAllProductsForAdmin() : await getProducts();
  return source.find((product) => product.id === id);
}

export async function getFeaturedProducts() {
  return (await getProducts()).filter((product) => product.featured);
}

type ReviewImageRow = {
  id: string;
  storage_path: string;
  public_url: string;
  alt_text: string;
  position: number;
  created_at: string;
  updated_at: string;
};

function mapReviewImage(row: ReviewImageRow): ReviewImage {
  return {
    id: row.id,
    path: row.storage_path,
    url: row.public_url,
    alt: row.alt_text,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const getReviewImages = cache(async (): Promise<ReviewImage[]> => {
  if (!isSupabaseConfigured || useLocalStorefrontFallback) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("review_images")
    .select("*")
    .order("position")
    .order("created_at");
  if (error) throw new StorefrontUnavailableError();
  return (data as ReviewImageRow[]).map(mapReviewImage);
});

export const getReviewImagesForAdmin = cache(async (): Promise<ReviewImage[]> => {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("review_images")
    .select("*")
    .order("position")
    .order("created_at");
  if (error) throw error;
  return (data as ReviewImageRow[]).map(mapReviewImage);
});

export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  if (!isSupabaseConfigured || useLocalStorefrontFallback) return siteConfig;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (error || !data) throw new StorefrontUnavailableError();
  return {
    whatsappNumber: data.whatsapp_number,
    whatsappDisplayNumber: data.whatsapp_display_number,
    instagramUrl: data.instagram_url,
    tiktokUrl: data.tiktok_url,
    email: data.email,
    location: data.location,
    supportHours: data.support_hours,
    heroEyebrow: data.hero_eyebrow,
    heroTitle: data.hero_title,
    heroDescription: data.hero_description,
    heroFeaturedProductId: data.hero_featured_product_id ?? null,
    deliveryNote: data.delivery_note ?? siteConfig.deliveryNote,
    returnsNote: data.returns_note ?? siteConfig.returnsNote,
    sizeGuideNote: data.size_guide_note ?? siteConfig.sizeGuideNote,
    orderReplyEnabled:
      data.order_reply_enabled ?? siteConfig.orderReplyEnabled,
    orderReplyTemplate:
      data.order_reply_template ?? siteConfig.orderReplyTemplate,
    siteConfirmationTemplate:
      data.site_confirmation_template ?? siteConfig.siteConfirmationTemplate,
    whatsappConfirmationTemplate:
      data.whatsapp_confirmation_template ?? siteConfig.whatsappConfirmationTemplate,
  };
});
