import type { RestaurantSettingsDraft } from '@/types';

const STORAGE_PREFIX = 'restaurant-admin-settings';

export function readLocalSettings(restaurantId: number): Pick<RestaurantSettingsDraft, 'openingHours' | 'commissionRatePct'> {
  if (typeof window === 'undefined') {
    return { openingHours: 'Mon-Sun: 10:00-22:00', commissionRatePct: 12 };
  }

  const key = `${STORAGE_PREFIX}-${restaurantId}`;
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return { openingHours: 'Mon-Sun: 10:00-22:00', commissionRatePct: 12 };
  }

  try {
    const parsed = JSON.parse(raw) as { openingHours?: string; commissionRatePct?: number };
    return {
      openingHours: parsed.openingHours || 'Mon-Sun: 10:00-22:00',
      commissionRatePct: parsed.commissionRatePct || 12
    };
  } catch {
    return { openingHours: 'Mon-Sun: 10:00-22:00', commissionRatePct: 12 };
  }
}

export function writeLocalSettings(restaurantId: number, payload: { openingHours: string; commissionRatePct: number }): void {
  const key = `${STORAGE_PREFIX}-${restaurantId}`;
  window.localStorage.setItem(key, JSON.stringify(payload));
}
