import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Shoesoco and our approach to everyday footwear.",
};

const values = [
  {
    number: "01",
    title: "Comfort first",
    text: "Every pair begins with how it feels through a full day of movement.",
  },
  {
    number: "02",
    title: "Clean design",
    text: "Versatile silhouettes and considered details that work beyond one season.",
  },
  {
    number: "03",
    title: "Personal service",
    text: "Real support through WhatsApp to help you choose the right style and fit.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="py-14 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="eyebrow">About Shoesoco</p>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-6xl">
                Good shoes should make every day feel better.
              </h1>
            </div>
            <p className="max-w-xl text-base leading-8 text-neutral-600 sm:text-lg">
              Shoesoco is focused on sneakers and running shoes: two essential
              categories selected for dependable comfort, clean design, and
              straightforward personal service.
            </p>
          </div>

          <div className="relative mt-14 min-h-[360px] overflow-hidden rounded-[2rem] bg-[#181b21] sm:min-h-[500px]">
            <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[#181b21]/60 blur-3xl" />
            <div className="absolute bottom-[12%] left-[8%] h-12 w-[70%] rounded-full bg-black/20 blur-2xl" />
            <div className="absolute inset-8 sm:inset-12">
              <Image
                alt="Shoesoco sneaker"
                className="-rotate-6 object-contain drop-shadow-[0_40px_45px_rgba(41,34,25,0.22)]"
                fill
                loading="eager"
                priority
                sizes="(min-width: 1280px) 1100px, 90vw"
                src="/images/products/sneaker.png"
              />
            </div>
            <p className="absolute bottom-7 right-8 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-600">
              Everyday movement / Cairo
            </p>
          </div>
        </Container>
      </section>

      <section className="border-y border-neutral-200 bg-[#0f1115] py-16 text-[#f4f1ea] sm:py-24">
        <Container>
          <div className="grid gap-10 md:grid-cols-3">
            {values.map((value) => (
              <article className="border-t border-[#2a2e36]/15 pt-6" key={value.number}>
                <p className="text-xs font-bold text-[#c6ff3a]">
                  {value.number}
                </p>
                <h2 className="mt-5 text-2xl font-semibold">{value.title}</h2>
                <p className="mt-4 leading-7 text-neutral-400">{value.text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Meet your next everyday pair.
          </h2>
          <Link
            className="mt-7 inline-flex items-center gap-3 rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-[#f4f1ea]"
            href="/products"
          >
            Explore products
            <ArrowIcon className="h-4 w-4" />
          </Link>
        </Container>
      </section>
    </>
  );
}
