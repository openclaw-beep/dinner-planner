'use client';

const STORAGE_KEY = 'dinner-user-session';

export interface UserSession {
  userId: number;
  authToken: string;
}

export function readUserSession(): UserSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as UserSession;
    if (Number.isFinite(parsed.userId) && typeof parsed.authToken === 'string' && parsed.authToken.length > 10) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

export function writeUserSession(session: UserSession): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}
