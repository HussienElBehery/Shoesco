import { describe, expect, it } from "vitest";

import {
  MAX_REVIEW_IMAGE_BYTES,
  validateReviewCollectionSize,
  validateReviewImage,
} from "@/lib/review-images";

describe("review image validation", () => {
  it("accepts the supported image formats up to 5 MB", () => {
    expect(validateReviewImage({ type: "image/jpeg", size: MAX_REVIEW_IMAGE_BYTES })).toBe("jpg");
    expect(validateReviewImage({ type: "image/png", size: 10 })).toBe("png");
    expect(validateReviewImage({ type: "image/webp", size: 10 })).toBe("webp");
  });

  it("rejects unsupported files and oversized images", () => {
    expect(() => validateReviewImage({ type: "image/gif", size: 10 })).toThrow(/JPG/);
    expect(() => validateReviewImage({ type: "image/png", size: MAX_REVIEW_IMAGE_BYTES + 1 })).toThrow(/5 MB/);
  });

  it("enforces the 20-image live collection limit", () => {
    expect(() => validateReviewCollectionSize(19, 1)).not.toThrow();
    expect(() => validateReviewCollectionSize(19, 2)).toThrow(/maximum of 20/);
    expect(() => validateReviewCollectionSize(0, 0)).toThrow(/at least one/);
  });
});
