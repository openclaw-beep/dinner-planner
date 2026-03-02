"use client";

import { useEffect, useState } from "react";
import { getRestaurantReviews, Review } from "@/lib/api";
import { ReviewCard } from "@/components/ReviewCard";

type ReviewsListProps = {
  restaurantId: number;
  initialLimit?: number;
};

function ReviewSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-ink/10 bg-white p-4 sm:p-5">
      <div className="h-4 w-28 rounded bg-ink/10" />
      <div className="mt-4 h-3 w-full rounded bg-ink/10" />
      <div className="mt-2 h-3 w-4/5 rounded bg-ink/10" />
      <div className="mt-4 h-3 w-32 rounded bg-ink/10" />
    </div>
  );
}

export function ReviewsList({ restaurantId, initialLimit = 5 }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFirstPage() {
      if (Number.isNaN(restaurantId)) {
        setError("Invalid restaurant ID.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await getRestaurantReviews(restaurantId, { page: 1, limit: initialLimit });
        if (cancelled) return;
        setReviews(response.reviews);
        setHasMore(response.hasMore);
        setPage(1);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load reviews.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadFirstPage();
    return () => {
      cancelled = true;
    };
  }, [restaurantId, initialLimit]);

  async function handleLoadMore() {
    const nextPage = page + 1;
    try {
      setIsLoadingMore(true);
      setError(null);
      const response = await getRestaurantReviews(restaurantId, { page: nextPage, limit: initialLimit });
      setReviews((prev) => [...prev, ...response.reviews]);
      setHasMore(response.hasMore);
      setPage(nextPage);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load more reviews.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <ReviewSkeleton />
        <ReviewSkeleton />
      </div>
    );
  }

  if (error) {
    return <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>;
  }

  if (reviews.length === 0) {
    return <p className="rounded-xl border border-ink/10 bg-white p-4 text-sm text-ink/70">No reviews yet</p>;
  }

  return (
    <div>
      <div className="space-y-3">
        {reviews.map((review) => (
          <ReviewCard key={`${review.id}-${review.created_at}`} review={review} />
        ))}
      </div>

      {hasMore ? (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isLoadingMore}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-ink/20 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoadingMore ? "Loading..." : "Load More"}
        </button>
      ) : null}
    </div>
  );
}
