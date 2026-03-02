'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { confirmBooking, denyBooking, listBookings } from '@/lib/api';
import type { Booking } from '@/types';

export interface UseBookingFeedResult {
  bookings: Booking[];
  pending: Booking[];
  confirmed: Booking[];
  history: Booking[];
  busyId: number | null;
  error: string | null;
  notifications: Array<{ id: number; text: string }>;
  successMessage: string;
  celebrationKey: number;
  refresh: () => Promise<void>;
  confirm: (bookingId: number) => Promise<void>;
  deny: (bookingId: number) => Promise<void>;
}

export function useBookingFeed(restaurantId: number | null): UseBookingFeedResult {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Array<{ id: number; text: string }>>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [celebrationKey, setCelebrationKey] = useState(0);
  const seenPendingIdsRef = useRef<Set<number>>(new Set());

  const refresh = useCallback(async () => {
    if (!restaurantId || restaurantId <= 0) {
      setBookings([]);
      return;
    }

    try {
      const data = await listBookings({ restaurantId });
      setBookings(data);

      const newPending = data.filter((item) => item.status === 'pending' && !seenPendingIdsRef.current.has(item.id));
      if (newPending.length > 0) {
        setNotifications((current) => {
          const next = [
            ...newPending.map((item) => ({
              id: Number(`${Date.now()}${item.id}`),
              text: `New booking #${item.id} for ${item.party_size} guests at ${new Date(item.reservation_at).toLocaleTimeString()}`
            })),
            ...current
          ];
          return next.slice(0, 4);
        });
      }

      seenPendingIdsRef.current = new Set(data.filter((item) => item.status === 'pending').map((item) => item.id));
      setError(null);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Failed to load bookings.');
    }
  }, [restaurantId]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, 10000);

    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (notifications.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setNotifications((current) => current.slice(0, -1));
    }, 4500);

    return () => window.clearTimeout(timer);
  }, [notifications]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }
    const timer = window.setTimeout(() => setSuccessMessage(''), 2200);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const confirm = useCallback(
    async (bookingId: number) => {
      setBusyId(bookingId);
      try {
        await confirmBooking(bookingId);
        await refresh();
        setSuccessMessage(`Booking #${bookingId} confirmed.`);
        setCelebrationKey((current) => current + 1);
      } catch (confirmError) {
        setError(confirmError instanceof Error ? confirmError.message : 'Failed to confirm booking.');
      } finally {
        setBusyId(null);
      }
    },
    [refresh]
  );

  const deny = useCallback(
    async (bookingId: number) => {
      setBusyId(bookingId);
      try {
        await denyBooking(bookingId);
        await refresh();
        setSuccessMessage(`Booking #${bookingId} denied.`);
      } catch (denyError) {
        setError(denyError instanceof Error ? denyError.message : 'Failed to deny booking.');
      } finally {
        setBusyId(null);
      }
    },
    [refresh]
  );

  const pending = useMemo(() => bookings.filter((item) => item.status === 'pending'), [bookings]);
  const confirmed = useMemo(() => bookings.filter((item) => item.status === 'confirmed'), [bookings]);
  const history = useMemo(() => bookings.filter((item) => item.status !== 'pending'), [bookings]);

  return { bookings, pending, confirmed, history, busyId, error, notifications, successMessage, celebrationKey, refresh, confirm, deny };
}
