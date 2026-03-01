export function MetricCard({ label, value, accent }: { label: string; value: string; accent: string }): JSX.Element | null {
  return (
    <article className={`rounded-xl border p-4 ${accent}`}>
      <p className="text-xs uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </article>
  );
}
