'use client';

import { useEffect, useState } from 'react';

const colors = ['bg-dinner-gold', 'bg-dinner-burgundy', 'bg-dinner-emerald', 'bg-amber-400'];

export function BookingConfetti({ triggerKey }: { triggerKey: number }): JSX.Element | null {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!triggerKey) {
      return;
    }
    setActive(true);
    const timer = window.setTimeout(() => setActive(false), 900);
    return () => window.clearTimeout(timer);
  }, [triggerKey]);

  if (!active) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-44 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 24 }).map((_, index) => (
        <span
          key={`${triggerKey}-${index}`}
          className={`absolute top-2 h-2 w-2 rounded-sm ${colors[index % colors.length]} animate-[confettiFall_900ms_ease-out_forwards]`}
          style={{
            left: `${(index / 24) * 100}%`,
            transform: `rotate(${index * 17}deg)`,
            animationDelay: `${(index % 6) * 40}ms`
          }}
        />
      ))}
    </div>
  );
}
