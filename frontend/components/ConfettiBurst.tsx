'use client';

import { useEffect, useState } from 'react';

const colors = ['bg-dinner-gold', 'bg-dinner-burgundy', 'bg-dinner-emerald', 'bg-amber-400'];

export function ConfettiBurst({ active }: { active: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      return;
    }
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 1000);
    return () => window.clearTimeout(timer);
  }, [active]);

  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-56 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 28 }).map((_, index) => (
        <span
          key={index}
          className={`absolute top-2 h-2 w-2 rounded-sm ${colors[index % colors.length]} animate-[confettiDrop_1s_ease-out_forwards]`}
          style={{ left: `${(index / 28) * 100}%`, animationDelay: `${(index % 7) * 35}ms` }}
        />
      ))}
    </div>
  );
}
