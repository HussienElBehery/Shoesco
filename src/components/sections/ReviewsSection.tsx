"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Container } from "@/components/ui/Container";
import {
  getWrappedReviewIndex,
  REVIEW_AUTOPLAY_INTERVAL_MS,
} from "@/lib/review-carousel";
import type { ReviewImage } from "@/types/product";

export function ReviewsSection({ reviews }: { reviews: ReviewImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [timerVersion, setTimerVersion] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);
    return () => media.removeEventListener("change", updateMotion);
  }, []);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (reviews.length < 2 || paused || !pageVisible || reducedMotion) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % reviews.length);
    }, REVIEW_AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [pageVisible, paused, reducedMotion, reviews.length, timerVersion]);

  function showReview(index: number) {
    if (!reviews.length) return;
    setActiveIndex(getWrappedReviewIndex(index, reviews.length));
    setTimerVersion((current) => current + 1);
  }

  const safeActiveIndex = getWrappedReviewIndex(activeIndex, reviews.length);
  const activeReview = reviews[safeActiveIndex];

  return (
    <section className="overflow-hidden py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-5xl text-center">
          <p className="eyebrow">Customer reviews</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">Shared by our customers.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">
            Real feedback and order experiences from the Shoesoco community.
          </p>
        </div>

        {!activeReview ? (
          <div className="mx-auto mt-10 flex min-h-72 max-w-4xl items-center justify-center rounded-[2rem] border border-dashed border-[#2a2e36] bg-[#181b21] px-6 text-center text-neutral-500">
            Customer review screenshots will appear here soon.
          </div>
        ) : (
          <div
            aria-label="Customer review carousel"
            className="relative mx-auto mt-10 max-w-5xl"
            onBlur={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") showReview(safeActiveIndex - 1);
              if (event.key === "ArrowRight") showReview(safeActiveIndex + 1);
            }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            tabIndex={0}
          >
            <div className="relative aspect-[4/5] min-h-[420px] max-h-[720px] overflow-hidden rounded-[2rem] border border-[#2a2e36] bg-[#101216] shadow-[0_25px_80px_rgba(0,0,0,0.28)] sm:aspect-[16/10] sm:min-h-[520px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(198,255,58,0.07),transparent_45%)]" />
              <Image
                alt={activeReview.alt}
                className="object-contain p-5 sm:p-8"
                fill
                key={activeReview.id}
                sizes="(min-width: 1024px) 960px, 92vw"
                src={activeReview.url}
              />
            </div>

            {reviews.length > 1 && (
              <>
                <button
                  aria-label="Show previous review"
                  className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#3a3f49] bg-[#0f1115]/90 text-xl font-semibold shadow-lg transition hover:border-[#c6ff3a] hover:text-[#c6ff3a] sm:left-5 sm:h-12 sm:w-12"
                  onClick={() => showReview(safeActiveIndex - 1)}
                  type="button"
                >
                  ←
                </button>
                <button
                  aria-label="Show next review"
                  className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#3a3f49] bg-[#0f1115]/90 text-xl font-semibold shadow-lg transition hover:border-[#c6ff3a] hover:text-[#c6ff3a] sm:right-5 sm:h-12 sm:w-12"
                  onClick={() => showReview(safeActiveIndex + 1)}
                  type="button"
                >
                  →
                </button>
              </>
            )}

            <p className="mt-4 text-center text-xs font-semibold tracking-[0.14em] text-neutral-500">
              {safeActiveIndex + 1} / {reviews.length}
            </p>
          </div>
        )}
      </Container>
    </section>
  );
}
