'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { healthCheck } from '@/lib/api';
import { writeSession } from '@/lib/auth';

export function AdminLoginForm(): JSX.Element {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState('1');
  const [label, setLabel] = useState('My Restaurant');
  const [apiToken, setApiToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await healthCheck();
      const parsedId = Number(restaurantId);
      if (!Number.isFinite(parsedId) || parsedId <= 0) {
        throw new Error('Restaurant ID must be a positive number.');
      }
      if (!apiToken.trim()) {
        throw new Error('Admin API token is required.');
      }

      writeSession({
        restaurantId: parsedId,
        label: label.trim() || `Restaurant ${parsedId}`,
        apiToken: apiToken.trim()
      });

      router.push('/dashboard');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_15%_20%,rgba(212,175,55,0.3),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(128,0,32,0.28),transparent_30%),linear-gradient(135deg,#2C3E50_0%,#800020_100%)] p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-12 h-56 w-56 rounded-full bg-dinner-gold/25 blur-3xl animate-float" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-float [animation-delay:1s]" />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-dinner-burgundy/45 blur-3xl animate-float [animation-delay:2s]" />
      </div>

      <section className="relative z-10 w-full sm:max-w-md rounded-3xl border border-white/20 bg-white/12 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-dinner-gold to-dinner-burgundy text-3xl text-white shadow-lg">
          <span aria-hidden="true">🍽️</span>
        </div>
        <h1 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">Restaurant Admin</h1>
        <p className="mt-2 text-center text-sm text-white/80">Secure access for reservation operations</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" aria-label="Restaurant admin login form">
          <label className="block text-sm font-medium text-white">
            Restaurant Name
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="mt-1 min-h-12 w-full rounded-xl border border-white/30 bg-white/20 px-4 py-3 text-white placeholder:text-white/70 backdrop-blur-sm outline-none transition focus:border-dinner-gold focus:ring-4 focus:ring-dinner-gold/20"
              placeholder="Luna Bistro"
              aria-label="Restaurant Name"
            />
          </label>

          <label className="block text-sm font-medium text-white">
            Restaurant ID
            <input
              value={restaurantId}
              onChange={(event) => setRestaurantId(event.target.value)}
              className="mt-1 min-h-12 w-full rounded-xl border border-white/30 bg-white/20 px-4 py-3 text-white placeholder:text-white/70 backdrop-blur-sm outline-none transition focus:border-dinner-gold focus:ring-4 focus:ring-dinner-gold/20"
              inputMode="numeric"
              aria-label="Restaurant ID"
            />
          </label>

          <label className="block text-sm font-medium text-white">
            Admin API Token
            <input
              value={apiToken}
              onChange={(event) => setApiToken(event.target.value)}
              className="mt-1 min-h-12 w-full rounded-xl border border-white/30 bg-white/20 px-4 py-3 text-white placeholder:text-white/70 backdrop-blur-sm outline-none transition focus:border-dinner-gold focus:ring-4 focus:ring-dinner-gold/20"
              placeholder="Enter admin token"
              aria-label="Admin API Token"
              required
            />
          </label>

          {error ? <p className="rounded-xl bg-rose-900/40 px-3 py-2 text-sm text-rose-100">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full rounded-xl bg-gradient-to-r from-dinner-gold to-dinner-burgundy px-4 py-3 font-semibold text-white transition duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-white/80">
          <p className="rounded-full border border-white/30 bg-white/10 px-3 py-2 text-center">Secure</p>
          <p className="rounded-full border border-white/30 bg-white/10 px-3 py-2 text-center">Encrypted</p>
        </div>
      </section>
    </main>
  );
}
