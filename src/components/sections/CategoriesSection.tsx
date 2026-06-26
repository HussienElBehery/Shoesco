import Link from "next/link";

import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { Container } from "@/components/ui/Container";
import { RepresentativeImage } from "@/components/ui/RepresentativeImage";
import { homeCategoryCards } from "@/data/home-representatives";

const cardStyles = [
  {
    background: "bg-[#181b21]",
    text: "text-[#f4f1ea]",
    accent: "bg-neutral-950 text-[#f4f1ea]",
  },
  {
    background: "bg-[#20242b]",
    text: "text-[#f4f1ea]",
    accent: "bg-[#181b21] text-[#f4f1ea]",
  },
  {
    background: "bg-[#181b21]",
    text: "text-[#f4f1ea]",
    accent: "bg-[#c6ff3a] text-[#0f1115]",
  },
];

export function CategoriesSection() {
  return (
    <section className="bg-[#0f1115] py-20 text-[#f4f1ea] sm:py-28">
      <Container>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow !text-[#c6ff3a]">Browse your way</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
              Footwear, looked after.
            </h2>
          </div>
          <p className="max-w-md leading-7 text-neutral-400">
            Sneakers for the day, running shoes for the distance, and the
            essentials that keep every pair looking fresh.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {homeCategoryCards.map((collection, index) => {
            const style = cardStyles[index] ?? cardStyles[0];
            return (
            <Link
              className={`${style.background} ${style.text} group relative min-h-[480px] overflow-hidden rounded-[2rem] p-7 sm:min-h-[560px] sm:p-10`}
              href={collection.href}
              key={collection.category}
            >
              <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[70px] border-[#2a2e36]/10" />
              <span className="absolute right-7 top-7 text-7xl font-semibold tracking-[-0.08em] opacity-[0.08] sm:text-9xl">
                0{index + 1}
              </span>

              <div className="absolute inset-x-5 bottom-14 top-[43%] transition duration-700 ease-out group-hover:scale-[1.02] sm:inset-x-8 sm:bottom-16 sm:top-[40%]">
                <RepresentativeImage
                  alt={collection.imageAlt}
                  fallbackLabel={collection.category}
                  imageClassName={`drop-shadow-[0_25px_25px_rgba(0,0,0,0.28)] ${collection.imageClass}`}
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
                <span className={`flex h-12 w-12 items-center justify-center rounded-full transition group-hover:-rotate-12 group-hover:scale-110 ${style.accent}`}>
                  <ArrowIcon className="h-5 w-5" />
                </span>
              </div>
            </Link>
          )})}
        </div>
      </Container>
    </section>
  );
}
