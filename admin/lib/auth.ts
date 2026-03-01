const STORAGE_KEY = 'restaurant-admin-session';

export interface AdminSession {
  restaurantId: number;
  label: string;
}

export function readSession(): AdminSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AdminSession;
    if (Number.isFinite(parsed.restaurantId)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function writeSession(session: AdminSession): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
