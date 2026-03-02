'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { clearSession, readSession, type AdminSession } from '@/lib/auth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '◈' },
  { href: '/bookings', label: 'Bookings', icon: '☰' }
];

export function AdminShell({ children }: { children: React.ReactNode }): JSX.Element | null {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const current = readSession();
    if (!current) {
      router.replace('/');
      return;
    }
    setSession(current);
  }, [router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const title = useMemo(() => {
    const active = navItems.find((item) => pathname.startsWith(item.href));
    return active ? active.label : 'Admin';
  }, [pathname]);

  if (!session) {
    return <div className="p-6 text-slate-700">Loading admin workspace...</div>;
  }

  return (
    <div className="min-h-screen bg-dinner-cream text-ink">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 p-4 md:grid-cols-[240px_1fr]">
        <button
          type="button"
          aria-label="Toggle sidebar"
          onClick={() => setMobileOpen((current) => !current)}
          className="min-h-12 rounded-xl bg-dinner-charcoal px-4 text-white md:hidden"
        >
          ☰ Menu
        </button>

        <aside
          className={`rounded-2xl bg-gradient-to-b from-dinner-charcoal to-dinner-burgundy p-5 text-white shadow-xl transition-transform duration-300 md:translate-x-0 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-[120%] md:translate-x-0'
          } fixed left-4 right-4 top-20 z-40 md:static md:left-auto md:right-auto md:top-auto`}
        >
          <p className="text-xs uppercase tracking-wider text-white/70">Restaurant Admin</p>
          <p className="mt-2 text-lg font-semibold text-white">{session.label}</p>
          <p className="text-xs text-white/70">ID: {session.restaurantId}</p>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-12 items-center gap-2 rounded-lg px-3 py-2 text-sm text-white transition ${
                    active ? 'bg-white/20' : 'hover:bg-white/15'
                  }`}
                >
                  <span className="text-white" aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="mt-8 min-h-12 w-full rounded-lg border border-white/30 px-3 py-2 text-sm text-white transition hover:bg-white/15"
            onClick={() => {
              clearSession();
              router.replace('/');
            }}
          >
            Log out
          </button>
        </aside>

        {mobileOpen ? <button type="button" aria-label="Close sidebar" className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileOpen(false)} /> : null}

        <main className="rounded-2xl border border-dinner-gold/20 bg-dinner-cream p-6 shadow-lg">
          <header className="mb-5 border-b border-dinner-gold/20 pb-4">
            <h1 className="text-2xl font-semibold text-dinner-charcoal">{title}</h1>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
