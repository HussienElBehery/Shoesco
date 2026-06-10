import Image from "next/image";
import Link from "next/link";

import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { Container } from "@/components/ui/Container";
const collections = [
  {
    category: "Sneakers",
    eyebrow: "Everyday / 01",
    title: "Own the street.",
    description: "Clean silhouettes made for daily plans and effortless style.",
    image: "/images/products/sneaker.png",
    background: "bg-[#e8e1d5]",
    text: "text-neutral-950",
    accent: "bg-neutral-950 text-white",
    position: "right-[-8%] bottom-[-5%] h-[70%] w-[85%] -rotate-6",
  },
  {
    category: "Running",
    eyebrow: "Performance / 02",
    title: "Find your pace.",
    description: "Responsive comfort built for movement, distance, and momentum.",
    image: "/images/hero/running.png",
    background: "bg-[#303936]",
    text: "text-white",
    accent: "bg-white text-neutral-950",
    position: "left-[-7%] bottom-[-4%] h-[72%] w-[88%] rotate-6",
  },
];

export function CategoriesSection() {
  return (
    <section className="bg-[#171918] py-20 text-white sm:py-28">
      <Container>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow !text-[#c99b68]">Browse your way</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
              Two ways to move.
            </h2>
          </div>
          <p className="max-w-md leading-7 text-neutral-400">
            Shoesco is focused on two things done well: sneakers for the day
            and running shoes for the distance.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {collections.map((collection, index) => (
            <Link
              className={`${collection.background} ${collection.text} group relative min-h-[480px] overflow-hidden rounded-[2rem] p-7 sm:min-h-[560px] sm:p-10`}
              href={`/products?category=${collection.category}`}
              key={collection.category}
            >
              <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[70px] border-white/10" />
              <span className="absolute right-7 top-7 text-7xl font-semibold tracking-[-0.08em] opacity-[0.08] sm:text-9xl">
                0{index + 1}
              </span>

              <div className={`absolute ${collection.position} transition duration-700 ease-out group-hover:scale-105`}>
                <Image
                  alt={`${collection.category} collection`}
                  className="object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.18)]"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  src={collection.image}
                />
              </div>

              <div className="relative z-10 max-w-sm">
                <p className="text-xs font-bold uppercase tracking-[0.22em] opacity-60">
                  {collection.eyebrow}
                </p>
                <h3 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                  {collection.title}
                </h3>
                <p className="mt-4 max-w-xs leading-7 opacity-65">
                  {collection.description}
                </p>
              </div>

              <div className="absolute bottom-7 right-7 z-10 sm:bottom-10 sm:right-10">
                <span className={`flex h-12 w-12 items-center justify-center rounded-full transition group-hover:-rotate-12 group-hover:scale-110 ${collection.accent}`}>
                  <ArrowIcon className="h-5 w-5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
