import { PriceTier } from "@/lib/restaurant-filters";
import { readUserSession } from "@/lib/user-session";

export type Restaurant = {
  id: number;
  name: string;
  cuisine: string;
  city: string;
  address: string;
  capacity: number;
  average_price_per_guest: number;
  price_tier?: PriceTier;
  outdoor_seating?: boolean;
  dietary_options?: string[];
  ambiance_tags?: string[];
  average_rating?: number;
  review_count?: number;
  available?: boolean;
};

export type SearchRestaurantsResponse = {
  date: string;
  time: string;
  party_size: number;
  results: Restaurant[];
};

export type AvailabilityStatus = "available" | "limited" | "full";

export type AvailabilitySlot = {
  time: string;
  status: AvailabilityStatus;
  spots_left: number | null;
};

export type RestaurantAvailabilityResponse = {
  date: string;
  slots: AvailabilitySlot[];
};

export type CreateUserRequest = {
  name: string;
  phone_number: string;
};

export type User = {
  id: number;
  name: string;
  phone_number: string;
  auth_token: string;
};

export type CreateBookingRequest = {
  restaurant_id: number;
  reservation_at: string;
  party_size: number;
};

export type Booking = {
  id: number;
  user_id: number;
  restaurant_id: number;
  reservation_at: string;
  party_size: number;
  status: string;
  confirmation_code: string;
  created_at: string;
};

export type Review = {
  id: number;
  rating: number;
  text: string;
  user_name: string;
  created_at: string;
  verified: boolean;
};

type RawReview = {
  id?: number;
  rating?: number;
  stars?: number;
  review_text?: string;
  text?: string;
  comment?: string;
  user_name?: string;
  user?: { name?: string };
  created_at?: string;
  date?: string;
  verified?: boolean;
  is_verified?: boolean;
};

export type GetRestaurantReviewsResponse = {
  reviews: Review[];
  hasMore: boolean;
};

export type CreateBookingReviewRequest = {
  rating: number;
  text?: string;
};

export type RestaurantRating = {
  average: number;
  count: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://dinner-api.domain.com";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

function withUserAuthHeaders(headers: HeadersInit = {}): HeadersInit {
  const session = readUserSession();
  if (!session) {
    throw new Error("You must sign in before continuing.");
  }

  return {
    ...headers,
    "X-User-Token": session.authToken,
  };
}

export async function searchRestaurants(params: {
  date: string;
  time: string;
  partySize: number;
  city?: string;
  cuisines?: string[];
  prices?: PriceTier[];
  dietaryOptions?: string[];
  outdoorSeating?: boolean;
  ambiance?: string[];
}): Promise<SearchRestaurantsResponse> {
  const query = new URLSearchParams({
    date: params.date,
    time: params.time,
    party_size: String(params.partySize),
  });

  if (params.city) {
    query.set("city", params.city);
  }

  if (params.cuisines?.length) {
    query.set("cuisine", params.cuisines.join(","));
  }

  if (params.prices?.length) {
    query.set("price", params.prices.join(","));
  }

  if (params.dietaryOptions?.length) {
    query.set("dietary", params.dietaryOptions.join(","));
  }

  if (params.outdoorSeating) {
    query.set("outdoor", "true");
  }

  if (params.ambiance?.length) {
    query.set("ambiance", params.ambiance.join(","));
  }

  return request<SearchRestaurantsResponse>(`/restaurants/search?${query.toString()}`);
}

export async function createUser(payload: CreateUserRequest): Promise<User> {
  return request<User>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createBooking(payload: CreateBookingRequest): Promise<Booking> {
  return request<Booking>("/bookings", {
    method: "POST",
    headers: withUserAuthHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function getBooking(id: number): Promise<Booking> {
  return request<Booking>(`/bookings/${id}`, {
    headers: withUserAuthHeaders(),
  });
}

export async function getRestaurantById(id: number): Promise<Restaurant> {
  return request<Restaurant>(`/restaurants/id/${id}`);
}

export async function getRestaurantAvailability(id: number, date: string): Promise<RestaurantAvailabilityResponse> {
  const query = new URLSearchParams({ date });
  return request<RestaurantAvailabilityResponse>(`/restaurants/${id}/availability?${query.toString()}`);
}

export async function getRestaurantRating(id: number): Promise<RestaurantRating> {
  return request<RestaurantRating>(`/restaurants/${id}/rating`);
}

function normalizeReview(raw: RawReview, index: number): Review {
  return {
    id: raw.id ?? index,
    rating: raw.rating ?? raw.stars ?? 0,
    text: raw.review_text ?? raw.text ?? raw.comment ?? "",
    user_name: raw.user_name ?? raw.user?.name ?? "Guest",
    created_at: raw.created_at ?? raw.date ?? new Date().toISOString(),
    verified: Boolean(raw.verified ?? raw.is_verified),
  };
}

export async function getRestaurantReviews(
  id: number,
  options: { page?: number; limit?: number } = {},
): Promise<GetRestaurantReviewsResponse> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 5;
  const offset = Math.max(0, page - 1) * limit;
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });

  const data = await request<unknown>(`/restaurants/${id}/reviews?${query.toString()}`);

  if (Array.isArray(data)) {
    const reviews = data.map((item, index) => normalizeReview(item as RawReview, index));
    return { reviews, hasMore: reviews.length === limit };
  }

  if (typeof data === "object" && data !== null) {
    const record = data as Record<string, unknown>;
    const reviewList = (record.reviews ?? record.items ?? record.data) as unknown;
    const normalized = Array.isArray(reviewList)
      ? reviewList.map((item, index) => normalizeReview(item as RawReview, index))
      : [];
    const hasMoreValue = record.has_more ?? record.hasMore ?? record.next_page;
    const hasMore =
      typeof hasMoreValue === "boolean" ? hasMoreValue : normalized.length === limit;
    return { reviews: normalized, hasMore };
  }

  return { reviews: [], hasMore: false };
}

export async function createBookingReview(bookingId: number, payload: CreateBookingReviewRequest): Promise<Review> {
  const data = await request<RawReview>(`/bookings/${bookingId}/review`, {
    method: "POST",
    headers: withUserAuthHeaders(),
    body: JSON.stringify({
      rating: payload.rating,
      review_text: payload.text?.trim() || undefined,
    }),
  });

  return normalizeReview(data, bookingId);
}
