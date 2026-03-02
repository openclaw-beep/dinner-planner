import { Restaurant } from "@/lib/api";

export type PriceTier = "$" | "$$" | "$$$" | "$$$$";

export const CUISINE_OPTIONS = [
  { value: "italian", label: "Italian", icon: "🍕" },
  { value: "sushi", label: "Sushi", icon: "🍣" },
  { value: "vegan", label: "Vegan", icon: "🥗" },
  { value: "mexican", label: "Mexican", icon: "🌮" },
  { value: "american", label: "American", icon: "🍔" },
  { value: "french", label: "French", icon: "🥖" },
  { value: "indian", label: "Indian", icon: "🍛" },
  { value: "mediterranean", label: "Mediterranean", icon: "🫒" },
] as const;

export const PRICE_OPTIONS: PriceTier[] = ["$", "$$", "$$$", "$$$$"];

export const DIETARY_OPTIONS = [
  { value: "vegan", label: "Vegan" },
  { value: "gf", label: "GF" },
  { value: "nut-free", label: "Nut-Free" },
  { value: "halal", label: "Halal" },
] as const;

export const AMBIANCE_OPTIONS = [
  { value: "romantic", label: "Romantic" },
  { value: "family", label: "Family" },
  { value: "business", label: "Business" },
] as const;

export function normalizeTag(value: string): string {
  return value.trim().toLowerCase();
}

export function getPriceTierFromAverage(amount: number): PriceTier {
  if (amount <= 20) {
    return "$";
  }

  if (amount <= 40) {
    return "$$";
  }

  if (amount <= 70) {
    return "$$$";
  }

  return "$$$$";
}

export function getRestaurantPriceTier(restaurant: Restaurant): PriceTier {
  if (restaurant.price_tier) {
    return restaurant.price_tier;
  }

  return getPriceTierFromAverage(Number(restaurant.average_price_per_guest));
}
