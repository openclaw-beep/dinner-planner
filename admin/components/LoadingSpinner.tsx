export function LoadingSpinner({ label = 'Loading' }: { label?: string }): JSX.Element {
  return (
    <div className="inline-flex items-center gap-3" role="status" aria-live="polite" aria-label={label}>
      <span className="h-5 w-5 rounded-full border-2 border-dinner-gold/30 border-t-dinner-gold animate-spin" aria-hidden="true" />
      <span className="text-sm text-dinner-charcoal/80">{label}</span>
    </div>
  );
}
