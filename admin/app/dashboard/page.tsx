'use client';

import { AdminShell } from '@/components/AdminShell';
import { BookingConfetti } from '@/components/BookingConfetti';
import { BookingTable } from '@/components/BookingTable';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MetricCard } from '@/components/MetricCard';
import { NotificationStack } from '@/components/NotificationStack';
import { SuccessToast } from '@/components/SuccessToast';
import { useAdminSession } from '@/hooks/useAdminSession';
import { useBookingFeed } from '@/hooks/useBookingFeed';
import { readLocalSettings } from '@/lib/adminSettings';

export default function DashboardPage(): JSX.Element {
  return (
    <AdminShell>
      <DashboardContent />
    </AdminShell>
  );
}

function DashboardContent(): JSX.Element {
  const session = useAdminSession();
  const feed = useBookingFeed(session?.restaurantId ?? null);

  if (!session) {
    return <LoadingSpinner label="Loading session..." />;
  }

  const local = readLocalSettings(session.restaurantId);
  const confirmedRevenue = feed.confirmed.reduce((total, booking) => total + booking.party_size * 50, 0);
  const estimatedCommission = confirmedRevenue * (local.commissionRatePct / 100);

  return (
    <div className="space-y-6">
      <BookingConfetti triggerKey={feed.celebrationKey} />
      <SuccessToast message={feed.successMessage} />
      <NotificationStack items={feed.notifications} />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Pending" value={String(feed.pending.length)} trend={feed.pending.length > 0 ? 'up' : 'down'} trendText="Awaiting action" icon="⧗" />
        <MetricCard label="Confirmed" value={String(feed.confirmed.length)} trend="up" trendText="Service ready" icon="✓" />
        <MetricCard label="Est. Revenue" value={`$${confirmedRevenue.toFixed(2)}`} trend="up" trendText="From confirmed" icon="$" />
        <MetricCard label="Commission" value={`$${estimatedCommission.toFixed(2)}`} trend="down" trendText="Platform share" icon="%" />
      </section>

      {feed.error ? <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{feed.error}</p> : null}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-dinner-charcoal">Pending Bookings</h2>
        <BookingTable bookings={feed.pending} busyId={feed.busyId} onConfirm={feed.confirm} onDeny={feed.deny} />
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-dinner-charcoal">Recent History</h2>
        <BookingTable bookings={feed.history.slice(0, 8)} busyId={feed.busyId} onConfirm={feed.confirm} onDeny={feed.deny} showActions={false} />
      </section>
    </div>
  );
}
