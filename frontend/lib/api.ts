export type Restaurant = {
  id: number;
  name: string;
  cuisine: string;
  city: string;
  address: string;
  capacity: number;
  average_price_per_guest: number;
  available?: boolean;
};

export type SearchRestaurantsResponse = {
  date: string;
  time: string;
  party_size: number;
  results: Restaurant[];
};

export type CreateUserRequest = {
  name: string;
  phone_number: string;
};

export type User = {
  id: number;
  name: string;
  phone_number: string;
};

export type CreateBookingRequest = {
  user_id: number;
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

export async function searchRestaurants(params: {
  date: string;
  time: string;
  partySize: number;
  city?: string;
}): Promise<SearchRestaurantsResponse> {
  const query = new URLSearchParams({
    date: params.date,
    time: params.time,
    party_size: String(params.partySize),
  });

  if (params.city) {
    query.set("city", params.city);
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
    body: JSON.stringify(payload),
  });
}

export async function getBooking(id: number): Promise<Booking> {
  return request<Booking>(`/bookings/${id}`);
}

export async function getRestaurantById(id: number): Promise<Restaurant> {
  return request<Restaurant>(`/restaurants/id/${id}`);
}
