import type { ProductCategory } from "@/types/product";

export type HomeRepresentative = {
  category: ProductCategory;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  href: string;
  imageClass: string;
};

export const homeHeroSlides: HomeRepresentative[] = [
  {
    category: "Sneakers",
    eyebrow: "Everyday / 01",
    title: "Sneakers",
    description: "Clean everyday silhouettes for daily plans.",
    image: "/images/products/sneaker.png",
    imageAlt: "Representative sneaker for the Sneakers category",
    href: "/products?category=Sneakers",
    imageClass: "scale-[1.05]",
  },
  {
    category: "Running",
    eyebrow: "Performance / 02",
    title: "Running",
    description: "Responsive comfort for movement and momentum.",
    image: "/images/hero/running.png",
    imageAlt: "Representative running shoe for the Running category",
    href: "/products?category=Running",
    imageClass: "scale-[1.02]",
  },
];

export const homeCategoryCards: HomeRepresentative[] = [
  {
    ...homeHeroSlides[0],
    title: "Own the street.",
    description: "Clean silhouettes made for daily plans and effortless style.",
    imageClass: "scale-[1.14]",
  },
  {
    ...homeHeroSlides[1],
    title: "Find your pace.",
    description: "Responsive comfort built for movement, distance, and momentum.",
    imageClass: "scale-[1.08]",
  },
  {
    category: "Shoe Care",
    eyebrow: "Essentials / 03",
    title: "Keep them fresh.",
    description: "Foams, brushes, and cleaning tools made for a sharper rotation.",
    image: "/images/categories/shoe-care-cutout.png",
    imageAlt: "Representative shoe care essentials",
    href: "/products?category=Shoe%20Care",
    imageClass: "scale-[1.04]",
  },
];
