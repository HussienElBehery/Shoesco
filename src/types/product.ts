export type ProductCategory = "Sneakers" | "Running";
export type ProductGender = "Men" | "Women" | "Unisex";
export type ProductFit = "Narrow" | "True to size" | "Roomy";
export type ProductWidth = "Narrow" | "Standard" | "Wide";

export type ProductImage = {
  id: string;
  path: string;
  url: string;
  alt: string;
  position: number;
};

export type ProductSize = {
  id: string;
  size: string;
  available: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: "EGP";
  category: ProductCategory;
  gender: ProductGender;
  colors: string[];
  images: ProductImage[];
  sizes: ProductSize[];
  shortDescription: string;
  description: string;
  fitNote: string;
  fit: ProductFit;
  width: ProductWidth;
  materials: string;
  care: string;
  merchandisingLabel: string;
  featured: boolean;
  published: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StoreSettings = {
  whatsappNumber: string;
  whatsappDisplayNumber: string;
  instagramUrl: string;
  tiktokUrl: string;
  email: string;
  location: string;
  supportHours: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  deliveryNote: string;
  returnsNote: string;
  sizeGuideNote: string;
};

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  availableSizes: string[];
  availableColors: string[];
};

export type WhatsAppOrderDetails = {
  customerName: string;
  deliveryArea: string;
  notes?: string;
};
