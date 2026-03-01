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

export function BookingTable({ bookings, busyId, onConfirm, onDeny, showActions = true }: BookingTableProps): JSX.Element {
  if (bookings.length === 0) {
    return <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No bookings in this view.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr className="text-left text-slate-500">
            <th className="px-2">ID</th>
            <th className="px-2">Date</th>
            <th className="px-2">Party</th>
            <th className="px-2">Code</th>
            <th className="px-2">Status</th>
            {showActions ? <th className="px-2">Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => {
            const isBusy = busyId === booking.id;
            return (
              <tr key={booking.id} className="rounded-lg bg-slate-50 text-slate-700">
                <td className="rounded-l-lg px-2 py-2 font-medium">#{booking.id}</td>
                <td className="px-2 py-2">{new Date(booking.reservation_at).toLocaleString()}</td>
                <td className="px-2 py-2">{booking.party_size}</td>
                <td className="px-2 py-2">{booking.confirmation_code}</td>
                <td className="px-2 py-2">
                  <BookingStatusBadge status={booking.status} />
                </td>
                {showActions ? (
                  <td className="rounded-r-lg px-2 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isBusy || booking.status !== 'pending'}
                        className="rounded-md bg-mint px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                        onClick={() => onConfirm(booking.id)}
                      >
                        YES
                      </button>
                      <button
                        type="button"
                        disabled={isBusy || booking.status !== 'pending'}
                        className="rounded-md bg-coral px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                        onClick={() => onDeny(booking.id)}
                      >
                        NO
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
