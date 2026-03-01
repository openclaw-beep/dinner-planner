'use client';

import { useMemo, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import { BookingTable } from '@/components/BookingTable';
import { CalendarView } from '@/components/CalendarView';
import { NotificationStack } from '@/components/NotificationStack';
import { useAdminSession } from '@/hooks/useAdminSession';
import { useBookingFeed } from '@/hooks/useBookingFeed';
import type { BookingStatus } from '@/types';

const tabs: Array<{ key: 'all' | BookingStatus; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'denied', label: 'Denied' }
];

export default function BookingsPage(): JSX.Element {
  return (
    <AdminShell>
      <BookingsContent />
    </AdminShell>
  );
}

function BookingsContent(): JSX.Element {
  const session = useAdminSession();
  const [activeTab, setActiveTab] = useState<'all' | BookingStatus>('all');
  const feed = useBookingFeed(session?.restaurantId ?? null);

  if (!session) {
    return <p className="text-slate-500">Loading session...</p>;
  }

  const filtered = useMemo(() => {
    if (activeTab === 'all') {
      return feed.bookings;
    }
    return feed.bookings.filter((booking) => booking.status === activeTab);
  }, [activeTab, feed.bookings]);

  return (
    <div className="space-y-6">
      <NotificationStack items={feed.notifications} />

      <section className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-3 py-1 text-sm font-medium ${
              activeTab === tab.key ? 'bg-slate text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {feed.error ? <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{feed.error}</p> : null}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate">Manage Bookings</h2>
        <BookingTable bookings={filtered} busyId={feed.busyId} onConfirm={feed.confirm} onDeny={feed.deny} />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate">Calendar View</h2>
        <CalendarView bookings={filtered} />
      </section>
    </div>
  );
}
