'use client';

import { useEffect, useState } from 'react';

import { readSession, type AdminSession } from '@/lib/auth';

export function useAdminSession(): AdminSession | null {
  const [session, setSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    setSession(readSession());
  }, []);

  return session;
}
