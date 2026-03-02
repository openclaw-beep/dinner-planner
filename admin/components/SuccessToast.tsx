'use client';

export function SuccessToast({ message }: { message: string }): JSX.Element | null {
  if (!message) {
    return null;
  }

  return (
    <div className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] -translate-x-1/2 animate-[slideIn_300ms_ease-out] rounded-xl border border-emerald-200 bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-xl sm:w-auto" role="status" aria-live="polite">
      <span className="mr-2" aria-hidden="true">
        ✓
      </span>
      {message}
    </div>
  );
}
