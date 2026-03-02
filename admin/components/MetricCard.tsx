interface MetricCardProps {
  label: string;
  value: string;
  trend: 'up' | 'down';
  trendText: string;
  icon: string;
}

export function MetricCard({ label, value, trend, trendText, icon }: MetricCardProps): JSX.Element | null {
  return (
    <article className="rounded-2xl border border-dinner-gold/20 bg-gradient-to-br from-white to-dinner-cream p-4 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-wide text-dinner-charcoal/70">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-dinner-gold/20 text-dinner-burgundy" aria-hidden="true">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-dinner-charcoal">{value}</p>
      <p className={`mt-2 text-xs font-semibold ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
        {trend === 'up' ? '↑' : '↓'} {trendText}
      </p>
    </article>
  );
}
