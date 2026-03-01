'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { healthCheck } from '@/lib/api';
import { writeSession } from '@/lib/auth';

export default function Home(): JSX.Element {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState('1');
  const [label, setLabel] = useState('My Restaurant');
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

      writeSession({
        restaurantId: parsedId,
        label: label.trim() || `Restaurant ${parsedId}`
      });

      router.push('/dashboard');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate via-slate-800 to-amber-700 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-slate">Restaurant Admin Login</h1>
        <p className="text-sm text-slate-500">Use your restaurant ID to access booking operations.</p>

        <label className="block text-sm font-medium text-slate-700">
          Restaurant Name
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="Luna Bistro"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Restaurant ID
          <input
            value={restaurantId}
            onChange={(event) => setRestaurantId(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            inputMode="numeric"
          />
        </label>

        {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate px-4 py-2 font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? 'Authenticating...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
