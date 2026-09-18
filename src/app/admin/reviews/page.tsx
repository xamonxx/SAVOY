import { redirect } from "next/navigation";
import { MessageSquareText, Star } from "lucide-react";

import { isAdminAuthenticated } from "@/lib/auth";
import { getReviewsForModeration } from "@/lib/reviews";
import { ReviewModerationActions } from "@/components/admin/review-moderation-actions";

export const metadata = {
  title: "Moderasi Ulasan — Admin SAVOY",
  robots: { index: false, follow: false },
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${i < rating ? "fill-primary-container text-primary-container" : "fill-transparent text-border-hairline-strong"}`}
        />
      ))}
    </span>
  );
}

export default async function AdminReviewsPage() {
  const isAuthed = await isAdminAuthenticated();
  if (!isAuthed) {
    redirect("/admin/login");
  }

  const reviews = await getReviewsForModeration();
  const pending = reviews.filter((r) => r.moderationStatus === "pending");
  const decided = reviews.filter((r) => r.moderationStatus !== "pending");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary-container/15 text-primary">
          <MessageSquareText className="size-5" />
        </span>
        <div>
          <h1 className="text-lg font-bold text-on-surface">Moderasi Ulasan</h1>
          <p className="text-xs text-muted-gray">
            Ulasan publik hanya tampil di beranda setelah disetujui di sini.
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-gray">
          Menunggu Persetujuan ({pending.length})
        </h2>
        <div className="overflow-hidden rounded-xl border border-border-hairline bg-surface shadow-hairline">
          {pending.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-gray">
              Tidak ada ulasan yang menunggu persetujuan.
            </p>
          ) : (
            <div className="divide-y divide-border-hairline">
              {pending.map((review) => (
                <div key={review.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Stars rating={review.rating} />
                      <span className="text-xs font-semibold text-on-surface">{review.author}</span>
                      <span className="text-[11px] text-muted-gray">{review.address}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant">{review.description}</p>
                    <p className="text-[11px] text-muted-gray">
                      {review.email ? `${review.email} • ` : ""}
                      {new Date(review.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <ReviewModerationActions id={review.id} currentStatus={review.moderationStatus} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-gray">
          Sudah Diputuskan ({decided.length})
        </h2>
        <div className="overflow-hidden rounded-xl border border-border-hairline bg-surface shadow-hairline">
          {decided.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-gray">
              Belum ada ulasan yang diputuskan.
            </p>
          ) : (
            <div className="divide-y divide-border-hairline">
              {decided.map((review) => (
                <div key={review.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Stars rating={review.rating} />
                      <span className="text-xs font-semibold text-on-surface">{review.author}</span>
                      <span className="text-[11px] text-muted-gray">{review.address}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant line-clamp-2">{review.description}</p>
                  </div>
                  <div className="shrink-0">
                    <ReviewModerationActions id={review.id} currentStatus={review.moderationStatus} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
