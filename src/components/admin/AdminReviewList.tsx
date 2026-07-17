"use client";

import Image from "next/image";

import {
  deleteReviewImage,
  moveReviewImage,
  updateReviewImage,
} from "@/app/admin/actions";
import type { ReviewImage } from "@/types/product";

export function AdminReviewList({ reviews }: { reviews: ReviewImage[] }) {
  if (!reviews.length) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-[#2a2e36] bg-[#181b21] p-10 text-center text-sm text-neutral-500">
        No review screenshots uploaded yet.
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4">
      {reviews.map((review, index) => (
        <article className="grid gap-5 rounded-2xl border border-[#2a2e36] bg-[#181b21] p-5 md:grid-cols-[180px_1fr]" key={review.id}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#0f1115]">
            <Image alt={review.alt} className="object-contain p-2" fill sizes="180px" src={review.url} />
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c6ff3a]">
                Slide {index + 1} of {reviews.length}
              </p>
              <div className="flex flex-wrap gap-2">
                <form action={moveReviewImage}>
                  <input name="id" type="hidden" value={review.id} />
                  <input name="direction" type="hidden" value="earlier" />
                  <button className="rounded-full border border-[#2a2e36] px-3 py-2 text-xs disabled:opacity-30" disabled={index === 0} type="submit">Move earlier</button>
                </form>
                <form action={moveReviewImage}>
                  <input name="id" type="hidden" value={review.id} />
                  <input name="direction" type="hidden" value="later" />
                  <button className="rounded-full border border-[#2a2e36] px-3 py-2 text-xs disabled:opacity-30" disabled={index === reviews.length - 1} type="submit">Move later</button>
                </form>
              </div>
            </div>
            <form action={updateReviewImage} className="mt-4">
              <input name="id" type="hidden" value={review.id} />
              <label className="block text-sm font-semibold">
                Accessibility description
                <input className="mt-2 h-11 w-full rounded-xl border border-[#2a2e36] bg-[#0f1115] px-4 text-sm" defaultValue={review.alt} maxLength={160} name="altText" required />
              </label>
              <button className="mt-3 rounded-full bg-[#c6ff3a] px-4 py-2 text-xs font-semibold text-[#0f1115]" type="submit">Save description</button>
            </form>
            <form
              action={deleteReviewImage}
              className="mt-4"
              onSubmit={(event) => {
                if (!window.confirm("Delete this review screenshot permanently?")) event.preventDefault();
              }}
            >
              <input name="id" type="hidden" value={review.id} />
              <button className="text-xs font-semibold text-red-300 underline" type="submit">Delete screenshot</button>
            </form>
          </div>
        </article>
      ))}
    </div>
  );
}
