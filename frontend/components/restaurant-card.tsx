import Link from "next/link";
import { Restaurant } from "@/lib/api";
import { CUISINE_OPTIONS, getRestaurantPriceTier, normalizeTag } from "@/lib/restaurant-filters";

type RestaurantCardProps = {
  restaurant: Restaurant;
  date: string;
  time: string;
  partySize: number;
};

export function RestaurantCard({ restaurant, date, time, partySize }: RestaurantCardProps) {
  const bookHref = `/book/${restaurant.id}?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&partySize=${partySize}&restaurantName=${encodeURIComponent(restaurant.name)}&restaurantCuisine=${encodeURIComponent(restaurant.cuisine)}&restaurantAddress=${encodeURIComponent(restaurant.address)}&restaurantCity=${encodeURIComponent(restaurant.city)}&restaurantPrice=${restaurant.average_price_per_guest}`;
  const cuisineIcon = CUISINE_OPTIONS.find((option) => normalizeTag(restaurant.cuisine).includes(option.value))?.icon ?? "🍽️";
  const priceTier = getRestaurantPriceTier(restaurant);

  return (
    <article className="rounded-2xl border border-ink/10 bg-white p-5 shadow-card transition hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">{restaurant.name}</h2>
          <p className="mt-1 text-sm text-ink/70">
            <span aria-hidden>{cuisineIcon}</span> {restaurant.cuisine}
          </p>
        </div>
        <span className="rounded-full bg-pine/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pine">
          ${Number(restaurant.average_price_per_guest).toFixed(0)} avg
        </span>
      </div>

      <div className="mt-3 inline-flex rounded-md bg-ink/5 px-2 py-1 text-xs font-semibold tracking-wide text-ink/80">{priceTier}</div>

      <p className="mt-4 text-sm text-ink/80">{restaurant.address}</p>
      <p className="mt-1 text-sm text-ink/60">{restaurant.city}</p>

      <div className="mt-5">
        <Link
          href={bookHref}
          className="inline-flex w-full items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90"
        >
          Book Now
        </Link>
      </div>
    </article>
  );
}
