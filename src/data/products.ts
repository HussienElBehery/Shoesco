import type { Product } from "@/types/product";

const sneakerImage = "/images/products/sneaker.png";
const runningImage = "/images/hero/running.png";
const now = "2026-06-10T00:00:00.000Z";

const catalog = [
  ["10000000-0000-4000-8000-000000000001", "urban-runner-white", "Urban Runner White", 3499, "Sneakers", "Unisex", ["White", "Light Gray"], sneakerImage],
  ["10000000-0000-4000-8000-000000000002", "street-core-black", "Street Core Black", 3799, "Sneakers", "Men", ["Black", "Charcoal"], sneakerImage],
  ["10000000-0000-4000-8000-000000000003", "court-line-cream", "Court Line Cream", 3299, "Sneakers", "Women", ["Beige", "Cream"], sneakerImage],
  ["10000000-0000-4000-8000-000000000004", "velocity-knit-blue", "Velocity Knit Blue", 4499, "Running", "Men", ["Navy", "Electric Blue"], runningImage],
  ["10000000-0000-4000-8000-000000000005", "metro-low-green", "Metro Low Green", 3199, "Sneakers", "Unisex", ["White", "Forest Green"], sneakerImage],
  ["10000000-0000-4000-8000-000000000006", "tempo-flex-rose", "Tempo Flex Rose", 3999, "Running", "Women", ["Dusty Rose", "White"], runningImage],
  ["10000000-0000-4000-8000-000000000007", "pace-shift-olive", "Pace Shift Olive", 4699, "Running", "Unisex", ["Olive", "Sand", "Black"], runningImage],
  ["10000000-0000-4000-8000-000000000008", "aero-run-black", "Aero Run Black", 4199, "Running", "Unisex", ["Black", "Graphite"], runningImage],
] as const;

export const products: Product[] = catalog.map(
  ([id, slug, name, price, category, gender, colors, image], index) => ({
    id,
    slug,
    name,
    price,
    currency: "EGP",
    category,
    gender,
    colors: [...colors],
    images: [{ id: `${id}-image`, path: image, url: image, alt: name, position: 0 }],
    sizes: Array.from(
      { length: gender === "Women" ? 6 : 8 },
      (_, sizeIndex) => ({
        id: `${id}-size-${sizeIndex}`,
        size: String((gender === "Women" ? 36 : 38) + sizeIndex),
        available: true,
      }),
    ),
    shortDescription:
      category === "Running"
        ? "A responsive running shoe with lightweight cushioning and secure support."
        : "A clean everyday sneaker with lightweight comfort and a modern profile.",
    description:
      category === "Running"
        ? `${name} combines breathable comfort, responsive cushioning, and stable support for runs, walks, and active days.`
        : `${name} is designed for daily wear with cushioned comfort, a versatile profile, and an easy-to-style finish.`,
    featured: [0, 2, 3, 5].includes(index),
    published: true,
    archived: false,
    createdAt: now,
    updatedAt: now,
  }),
);
