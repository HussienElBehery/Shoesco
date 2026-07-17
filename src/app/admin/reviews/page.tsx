import { uploadReviewImages } from "@/app/admin/actions";
import { AdminReviewList } from "@/components/admin/AdminReviewList";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin";
import { getReviewImagesForAdmin } from "@/lib/catalog";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ uploaded?: string; saved?: string; reordered?: string; deleted?: string }>;
}) {
  await requireAdmin();
  const [reviewResult, status] = await Promise.all([
    getReviewImagesForAdmin()
      .then((reviews) => ({ reviews, unavailable: false }))
      .catch(() => ({ reviews: [], unavailable: true })),
    searchParams,
  ]);
  const { reviews, unavailable } = reviewResult;
  const message = status.uploaded
    ? "Review screenshots uploaded and published."
    : status.saved
      ? "Review description saved."
      : status.reordered
        ? "Review order updated."
        : status.deleted
          ? "Review screenshot deleted."
          : "";

  return (
    <AdminShell>
      <p className="eyebrow">Social proof</p>
      <h1 className="mt-3 text-4xl font-semibold">Reviews</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
        Upload customer review screenshots for the homepage carousel. All uploads become live immediately.
      </p>
      {message && (
        <p className="mt-6 max-w-3xl rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{message}</p>
      )}

      {unavailable ? (
        <div className="mt-8 max-w-3xl rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-sm leading-6 text-amber-100">
          Reviews could not be loaded. Check the Supabase connection and ensure all database migrations have been applied, then reload this page.
        </div>
      ) : (
        <>
          <form action={uploadReviewImages} className="mt-8 max-w-3xl rounded-2xl border border-[#2a2e36] bg-[#181b21] p-6" encType="multipart/form-data">
            <h2 className="text-xl font-semibold">Upload screenshots</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              JPG, PNG, or WebP. Maximum 5 MB each and 20 live screenshots total.
            </p>
            <input accept="image/jpeg,image/png,image/webp" className="mt-5 block w-full text-sm" multiple name="reviewImages" required type="file" />
            <button className="mt-5 rounded-full bg-[#c6ff3a] px-5 py-3 text-sm font-semibold text-[#0f1115]" type="submit">Upload reviews</button>
          </form>

          <AdminReviewList reviews={reviews} />
        </>
      )}
    </AdminShell>
  );
}
