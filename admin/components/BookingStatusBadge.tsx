import type { BookingStatus } from '@/types';

const styles: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-900',
  confirmed: 'bg-emerald-100 text-emerald-900',
  denied: 'bg-rose-100 text-rose-900'
};

export function BookingStatusBadge({ status }: { status: BookingStatus }): JSX.Element {
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${styles[status]}`}>{status.toUpperCase()}</span>;
}
