import type { BookingStatus } from '@/types';

const styles: Record<BookingStatus, string> = {
  pending: 'border border-amber-200 bg-amber-100 text-amber-900',
  confirmed: 'border border-emerald-200 bg-emerald-100 text-emerald-900',
  denied: 'border border-rose-200 bg-rose-100 text-rose-900'
};

export function BookingStatusBadge({ status }: { status: BookingStatus }): JSX.Element | null {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>{status.toUpperCase()}</span>;
}
