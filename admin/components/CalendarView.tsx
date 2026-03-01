import type { Booking } from '@/types';

export function CalendarView({ bookings }: { bookings: Booking[] }): JSX.Element | null {
  const grouped = bookings.reduce<Record<string, Booking[]>>((acc, booking) => {
    const day = new Date(booking.reservation_at).toISOString().slice(0, 10);
    acc[day] = acc[day] ?? [];
    acc[day].push(booking);
    return acc;
  }, {});

  const keys = Object.keys(grouped).sort();

  if (keys.length === 0) {
    return <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">Calendar is empty for current filters.</p>;
  }

  return (
    <div className="space-y-3">
      {keys.map((key) => (
        <section key={key} className="rounded-xl border border-slate-100 p-3">
          <h3 className="text-sm font-semibold text-slate">{new Date(key).toDateString()}</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {grouped[key].map((booking) => (
              <li key={booking.id} className="rounded bg-slate-50 px-2 py-1">
                #{booking.id} at {new Date(booking.reservation_at).toLocaleTimeString()} for {booking.party_size} guests ({booking.status})
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
