export type BookingStatus = 'pending' | 'confirmed' | 'denied';

export interface Booking {
  id: number;
  user_id: number;
  restaurant_id: number;
  reservation_at: string;
  party_size: number;
  status: BookingStatus;
  confirmation_code: string;
  created_at: string;
}

export interface BookingStatusUpdateResponse {
  id: number;
  status: BookingStatus;
}

export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  city: string;
  address: string;
  capacity: number;
  average_price_per_guest: string;
  created_at: string;
}

export interface RestaurantSettingsDraft {
  name: string;
  cuisine: string;
  city: string;
  address: string;
  capacity: number;
  average_price_per_guest: number;
  openingHours: string;
  commissionRatePct: number;
}

export interface BookingFilters {
  restaurantId?: number;
  status?: BookingStatus;
}
