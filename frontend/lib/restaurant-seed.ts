import { Restaurant } from "@/lib/api";
import { getPriceTierFromAverage, normalizeTag } from "@/lib/restaurant-filters";

export const SEEDED_RESTAURANTS: Restaurant[] = [
  {
    id: 101,
    name: "Luna Trattoria",
    cuisine: "Italian",
    city: "San Francisco",
    address: "245 Valencia St",
    capacity: 72,
    average_price_per_guest: 38,
    available: true,
    outdoor_seating: true,
    dietary_options: ["vegan", "gf", "nut-free"],
    ambiance_tags: ["romantic", "family"],
  },
  {
    id: 102,
    name: "Sora Sushi House",
    cuisine: "Sushi",
    city: "San Francisco",
    address: "118 Market St",
    capacity: 54,
    average_price_per_guest: 64,
    available: true,
    outdoor_seating: false,
    dietary_options: ["gf", "halal"],
    ambiance_tags: ["business", "romantic"],
  },
  {
    id: 103,
    name: "Rooted Table",
    cuisine: "Vegan",
    city: "San Francisco",
    address: "44 Hayes St",
    capacity: 46,
    average_price_per_guest: 32,
    available: true,
    outdoor_seating: true,
    dietary_options: ["vegan", "gf", "nut-free", "halal"],
    ambiance_tags: ["family", "business"],
  },
  {
    id: 104,
    name: "Copper Flame Grill",
    cuisine: "American",
    city: "San Francisco",
    address: "770 Mission St",
    capacity: 88,
    average_price_per_guest: 51,
    available: true,
    outdoor_seating: true,
    dietary_options: ["gf", "nut-free"],
    ambiance_tags: ["business", "family"],
  },
  {
    id: 105,
    name: "Olive & Coast",
    cuisine: "Mediterranean",
    city: "San Francisco",
    address: "590 Howard St",
    capacity: 60,
    average_price_per_guest: 47,
    available: true,
    outdoor_seating: false,
    dietary_options: ["vegan", "halal"],
    ambiance_tags: ["romantic", "business"],
  },
];

const seedById = new Map<number, Restaurant>(SEEDED_RESTAURANTS.map((restaurant) => [restaurant.id, restaurant]));
const seedByName = new Map<string, Restaurant>(
  SEEDED_RESTAURANTS.map((restaurant) => [normalizeTag(restaurant.name), restaurant]),
);

export function enrichRestaurantData(restaurant: Restaurant): Restaurant {
  const matchingSeed = seedById.get(restaurant.id) ?? seedByName.get(normalizeTag(restaurant.name));

  return {
    ...matchingSeed,
    ...restaurant,
    price_tier: restaurant.price_tier ?? matchingSeed?.price_tier ?? getPriceTierFromAverage(restaurant.average_price_per_guest),
    dietary_options: restaurant.dietary_options ?? matchingSeed?.dietary_options ?? [],
    ambiance_tags: restaurant.ambiance_tags ?? matchingSeed?.ambiance_tags ?? [],
    outdoor_seating: restaurant.outdoor_seating ?? matchingSeed?.outdoor_seating ?? false,
  };
}
