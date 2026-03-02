'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

import { ConfettiBurst } from '@/components/ConfettiBurst';
import { SuccessToast } from '@/components/SuccessToast';
import { Booking, getBooking, getRestaurantById } from '@/lib/api';

export default function ConfirmationPage() {
  const params = useParams<{ bookingId: string }>();
  const searchParams = useSearchParams();
  const bookingId = Number(params.bookingId);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const providedAddress = searchParams.get('restaurantAddress');
  const [restaurantAddress, setRestaurantAddress] = useState(providedAddress ?? 'Loading address...');

  const restaurantName = searchParams.get('restaurantName') ?? 'Restaurant';
  const restaurantCity = searchParams.get('restaurantCity') ?? '';
  const restaurantPhone = searchParams.get('phone') ?? 'Not provided';

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (Number.isNaN(bookingId)) {
        setError('Invalid booking ID.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const bookingData = await getBooking(bookingId);
        if (cancelled) {
          return;
        }
        setBooking(bookingData);

        try {
          const restaurantData = await getRestaurantById(bookingData.restaurant_id);
          if (!cancelled) {
            setRestaurantAddress(restaurantData.address);
          }
        } catch {
          if (!cancelled && !providedAddress) {
            setRestaurantAddress('Address unavailable');
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load booking details.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [bookingId, providedAddress]);

  const calendarLink = useMemo(() => {
    if (!booking) {
      return '#';
    }

    const start = new Date(booking.reservation_at);
    const end = new Date(start.getTime() + 90 * 60 * 1000);
    const toGoogleDate = (value: Date) => value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const query = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Dinner Reservation - ${restaurantName}`,
      details: `Confirmation code: ${booking.confirmation_code}`,
      location: `${restaurantAddress} ${restaurantCity}`,
      dates: `${toGoogleDate(start)}/${toGoogleDate(end)}`
    });

    return `https://calendar.google.com/calendar/render?${query.toString()}`;
  }, [booking, restaurantAddress, restaurantCity, restaurantName]);

  return (
    <main className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <ConfettiBurst active={!isLoading && !error && Boolean(booking)} />
      <SuccessToast message={!isLoading && !error && booking ? 'Booking confirmed' : ''} />

      <section className="mx-auto w-full max-w-3xl rounded-3xl border border-ink/10 bg-white p-6 shadow-card sm:p-8">
        <p className="text-xs uppercase tracking-wider text-ink/60">Booking Confirmation</p>
        <h1 className="mt-2 text-3xl font-bold">Your table is reserved.</h1>

        {isLoading ? <p className="mt-6 text-sm text-ink/70">Loading confirmation details...</p> : null}
        {error ? <p className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        {!isLoading && !error && booking ? (
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl bg-accent/20 p-5 text-center">
              <p className="text-sm text-ink/70">Confirmation Code</p>
              <p className="mt-1 text-4xl font-bold tracking-[0.25em] text-brand">{booking.confirmation_code}</p>
            </div>

            <dl className="space-y-3 text-sm text-ink/80">
              <div>
                <dt className="font-semibold">Restaurant</dt>
                <dd>{restaurantName}</dd>
              </div>
              <div>
                <dt className="font-semibold">Address</dt>
                <dd>{restaurantAddress}</dd>
                <dd>{restaurantCity}</dd>
              </div>
              <div>
                <dt className="font-semibold">Phone</dt>
                <dd>{restaurantPhone}</dd>
              </div>
              <div>
                <dt className="font-semibold">Reservation Time</dt>
                <dd>{new Date(booking.reservation_at).toLocaleString()}</dd>
              </div>
            </dl>

            <a
              href={calendarLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-pine px-5 py-3 font-semibold text-white transition hover:bg-pine/90"
            >
              Add to Calendar
            </a>

            <p className="rounded-xl bg-base p-4 text-sm text-ink/80">Show this code when you arrive at the restaurant.</p>

            <Link href="/" className="inline-flex text-sm font-semibold text-brand hover:underline">
              Book another table
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
