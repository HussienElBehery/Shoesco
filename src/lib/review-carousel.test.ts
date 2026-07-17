import { describe, expect, it } from "vitest";

import {
  getWrappedReviewIndex,
  REVIEW_AUTOPLAY_INTERVAL_MS,
} from "@/lib/review-carousel";

describe("review carousel", () => {
  it("uses a 15-second automatic interval", () => {
    expect(REVIEW_AUTOPLAY_INTERVAL_MS).toBe(15_000);
  });

  it("wraps forward and backward review navigation", () => {
    expect(getWrappedReviewIndex(1, 3)).toBe(1);
    expect(getWrappedReviewIndex(3, 3)).toBe(0);
    expect(getWrappedReviewIndex(-1, 3)).toBe(2);
    expect(getWrappedReviewIndex(4, 0)).toBe(0);
  });
});
