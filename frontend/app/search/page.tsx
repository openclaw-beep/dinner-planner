"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchFilters, SearchFiltersState } from "@/components/SearchFilters";
import { RestaurantCard } from "@/components/restaurant-card";
import { Restaurant, searchRestaurants } from "@/lib/api";
import { enrichRestaurantData, SEEDED_RESTAURANTS } from "@/lib/restaurant-seed";
import { normalizeTag } from "@/lib/restaurant-filters";

function parseCsvParam(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => normalizeTag(item))
    .filter(Boolean);
}

export default function SearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const date = params.get("date") ?? "";
  const time = params.get("time") ?? "";
  const partySize = Number(params.get("partySize") ?? "2");

  const [results, setResults] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFiltersState>(() => ({
    cuisines: parseCsvParam(params.get("cuisine")),
    prices: [],
    dietaryOptions: [],
    outdoorSeating: false,
    ambiance: [],
  }));

  useEffect(() => {
    const query = new URLSearchParams();
    query.set("date", date);
    query.set("time", time);
    query.set("partySize", String(partySize));

    if (filters.cuisines.length) {
      query.set("cuisine", filters.cuisines.join(","));
    }

    router.replace(`${pathname}?${query.toString()}`, { scroll: false });
  }, [date, time, partySize, filters.cuisines, pathname, router]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!date || !time || Number.isNaN(partySize)) {
        setError("Missing search parameters. Go back and try again.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const data = await searchRestaurants({
          date,
          time,
          partySize,
          cuisines: filters.cuisines,
        });

        if (!cancelled) {
          const enrichedResults = (data.results ?? []).map(enrichRestaurantData);
          setResults(enrichedResults.length ? enrichedResults : SEEDED_RESTAURANTS);
        }
      } catch (loadError) {
        if (!cancelled) {
          setResults(SEEDED_RESTAURANTS);
          setError(loadError instanceof Error ? loadError.message : "Unable to fetch restaurants.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [date, time, partySize, filters.cuisines]);

  const filteredResults = useMemo(() => {
    if (!filters.cuisines.length) {
      return results;
    }

    return results.filter((restaurant) =>
      filters.cuisines.some((filterCuisine) => normalizeTag(restaurant.cuisine).includes(filterCuisine)),
    );
  }, [results, filters.cuisines]);

  function handleClearAll() {
    setFilters({
      cuisines: [],
      prices: [],
      dietaryOptions: [],
      outdoorSeating: false,
      ambiance: [],
    });
  }

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-wider text-ink/60">Search Results</p>
            <h1 className="mt-1 text-3xl font-bold">Available Restaurants</h1>
            <p className="mt-2 text-sm text-ink/70">
              {date} at {time} for {partySize} guests
            </p>
          </div>
          <Link href="/" className="rounded-xl border border-ink/20 px-4 py-2 text-sm font-medium hover:bg-white">
            New Search
          </Link>
        </div>

        <SearchFilters value={filters} onChange={setFilters} onClearAll={handleClearAll} />

        {isLoading ? (
          <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-6 text-sm text-ink/70">Loading restaurants...</div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-2xl border border-red-300 bg-red-50 p-6 text-sm text-red-700">{error}</div>
        ) : null}

        {!isLoading && !error ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResults.length > 0 ? (
              filteredResults.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} date={date} time={time} partySize={partySize} />
              ))
            ) : (
              <div className="rounded-2xl border border-ink/10 bg-white p-6 text-sm text-ink/75">
                No restaurants found for this search. Try a different time or party size.
              </div>
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}
