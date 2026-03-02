import { Review } from "@/lib/api";

type ReviewCardProps = {
  review: Review;
};

function Star({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={`h-4 w-4 ${filled ? "fill-amber-500" : "fill-ink/20"}`}>
      <path d="M10 1.8 12.5 7l5.8.8-4.2 4.1 1 5.8-5.1-2.7-5.1 2.7 1-5.8L1.7 7.8 7.5 7 10 1.8Z" />
    </svg>
  );
}

export function ReviewCard({ review }: ReviewCardProps) {
  const safeRating = Math.max(0, Math.min(5, Math.round(review.rating)));
  const createdAt = new Date(review.created_at);
  const formattedDate = Number.isNaN(createdAt.getTime())
    ? review.created_at
    : createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  return (
    <article className="rounded-2xl border border-ink/10 bg-white p-4 shadow-card sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1" aria-label={`${safeRating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} filled={index < safeRating} />
          ))}
        </div>

        {review.verified ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
            <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3.5 w-3.5 fill-green-600">
              <path d="M10 1.7 12.5 3l2.7-.5 1.4 2.3 2.3 1.4-.5 2.7 1.3 2.5-1.3 2.5.5 2.7-2.3 1.4-1.4 2.3-2.7-.5-2.5 1.3-2.5-1.3-2.7.5-1.4-2.3-2.3-1.4.5-2.7L1.7 12l1.3-2.5-.5-2.7 2.3-1.4 1.4-2.3 2.7.5L10 1.7Zm3.5 7-4.2 4.2-2.8-2.8-1.1 1.1 3.9 3.9 5.3-5.3-1.1-1.1Z" />
            </svg>
            Verified
          </span>
        ) : null}
      </div>

      {review.text ? <p className="mt-3 text-sm leading-6 text-ink/85 sm:text-base">{review.text}</p> : null}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink/60 sm:text-sm">
        <span className="font-medium text-ink/80">{review.user_name}</span>
        <time dateTime={review.created_at}>{formattedDate}</time>
      </div>
    </article>
  );
}
