export const REVIEW_AUTOPLAY_INTERVAL_MS = 15_000;

export function getWrappedReviewIndex(index: number, reviewCount: number) {
  if (reviewCount < 1) return 0;
  return ((index % reviewCount) + reviewCount) % reviewCount;
}
