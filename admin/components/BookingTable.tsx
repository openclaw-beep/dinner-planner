'use client';

import { BookingStatusBadge } from '@/components/BookingStatusBadge';
import type { Booking } from '@/types';

interface BookingTableProps {
  bookings: Booking[];
  busyId: number | null;
  onConfirm: (bookingId: number) => void;
  onDeny: (bookingId: number) => void;
  showActions?: boolean;
}

export function BookingTable({ bookings, busyId, onConfirm, onDeny, showActions = true }: BookingTableProps): JSX.Element | null {
  if (bookings.length === 0) {
    return <p className="rounded-lg bg-white/70 p-4 text-sm text-slate-500">No bookings in this view.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-dinner-gold/20 bg-white/80">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-dinner-gold/20 text-left text-dinner-charcoal/70">
            <th className="px-3 py-3">ID</th>
            <th className="px-3 py-3">Date</th>
            <th className="px-3 py-3">Party</th>
            <th className="px-3 py-3">Code</th>
            <th className="px-3 py-3">Status</th>
            {showActions ? <th className="px-3 py-3">Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => {
            const isBusy = busyId === booking.id;
            return (
              <tr key={booking.id} className="border-b border-dinner-gold/10 even:bg-white/50 hover:bg-dinner-gold/10">
                <td className="px-3 py-3 font-medium text-dinner-charcoal">#{booking.id}</td>
                <td className="px-3 py-3 text-dinner-charcoal/90">{new Date(booking.reservation_at).toLocaleString()}</td>
                <td className="px-3 py-3 text-dinner-charcoal/90">{booking.party_size}</td>
                <td className="px-3 py-3 text-dinner-charcoal/90">{booking.confirmation_code}</td>
                <td className="px-3 py-3">
                  <BookingStatusBadge status={booking.status} />
                </td>
                {showActions ? (
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isBusy || booking.status !== 'pending'}
                        className="min-h-12 rounded-md bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                        onClick={() => onConfirm(booking.id)}
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        disabled={isBusy || booking.status !== 'pending'}
                        className="min-h-12 rounded-md bg-gradient-to-r from-rose-500 to-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
                        onClick={() => onDeny(booking.id)}
                      >
                        Deny
                      </button>
                    </div>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
