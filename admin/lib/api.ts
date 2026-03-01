import type { Booking, BookingStatus, BookingStatusUpdateResponse, Restaurant } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

export async function healthCheck(): Promise<{ status: string }> {
  return http('/health');
}

export async function getRestaurant(restaurantId: number): Promise<Restaurant> {
  return http(`/restaurants/id/${restaurantId}`);
}

export async function updateRestaurant(
  restaurantId: number,
  payload: Partial<Pick<Restaurant, 'name' | 'cuisine' | 'city' | 'address' | 'capacity' | 'average_price_per_guest'>>
): Promise<Restaurant> {
  return http(`/restaurants/id/${restaurantId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function listBookings(params: {
  restaurantId: number;
  status?: BookingStatus;
}): Promise<Booking[]> {
  const search = new URLSearchParams({ restaurant_id: String(params.restaurantId) });
  if (params.status) {
    search.set('status', params.status);
  }
  return http(`/bookings?${search.toString()}`);
}

export async function confirmBooking(bookingId: number): Promise<BookingStatusUpdateResponse> {
  return http(`/bookings/${bookingId}/confirm`, { method: 'POST' });
}

export async function denyBooking(bookingId: number): Promise<BookingStatusUpdateResponse> {
  return http(`/bookings/${bookingId}/deny`, { method: 'POST' });
}
