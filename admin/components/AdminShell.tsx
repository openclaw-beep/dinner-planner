'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { clearSession, readSession, type AdminSession } from '@/lib/auth';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/settings', label: 'Settings' }
];

export function AdminShell({ children }: { children: React.ReactNode }): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    const current = readSession();
    if (!current) {
      router.replace('/admin/login');
      return;
    }
    setSession(current);
  }, [router]);

  const title = useMemo(() => {
    const active = navItems.find((item) => pathname.startsWith(item.href));
    return active ? active.label : 'Admin';
  }, [pathname]);

  if (!session) {
    return <div className="p-6 text-slate-700">Loading admin workspace...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand via-white to-amber-50 text-ink">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 p-4 md:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl bg-slate p-5 text-white shadow-lg">
          <p className="text-xs uppercase tracking-wider text-slate-300">Restaurant Admin</p>
          <p className="mt-2 text-lg font-semibold">{session.label}</p>
          <p className="text-xs text-slate-300">ID: {session.restaurantId}</p>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-sm ${active ? 'bg-white text-slate' : 'text-slate-100 hover:bg-slate-700'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="mt-8 w-full rounded-lg border border-slate-500 px-3 py-2 text-sm hover:bg-slate-700"
            onClick={() => {
              clearSession();
              router.replace('/admin/login');
            }}
          >
            Log out
          </button>
        </aside>

        <main className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-100">
          <header className="mb-5 border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-semibold text-slate">{title}</h1>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
