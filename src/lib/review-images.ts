export const MAX_REVIEW_IMAGES = 20;
export const MAX_REVIEW_IMAGE_BYTES = 5 * 1024 * 1024;

const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function validateReviewCollectionSize(current: number, incoming: number) {
  if (incoming < 1) throw new Error("Choose at least one review screenshot.");
  if (current + incoming > MAX_REVIEW_IMAGES) {
    throw new Error("A maximum of 20 review screenshots can be live at once.");
  }
}

export function validateReviewImage(file: { type: string; size: number }) {
  const extension = extensions[file.type];
  if (!extension) throw new Error("Review screenshots must be JPG, PNG, or WebP.");
  if (file.size > MAX_REVIEW_IMAGE_BYTES) {
    throw new Error("Each review screenshot must be 5 MB or smaller.");
  }
  return extension;
}
