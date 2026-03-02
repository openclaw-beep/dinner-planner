'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const heroImage =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1800&q=80';

const steps = [
  { title: 'Set Your Preferences', text: 'Select date, time, party size, and cuisine in seconds.' },
  { title: 'Compare Top Tables', text: 'Review curated restaurants and availability instantly.' },
  { title: 'Confirm In One Tap', text: 'Secure your reservation and receive your confirmation code.' }
];

export default function HomePage() {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [cuisine, setCuisine] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = new URLSearchParams({
      date,
      time,
      partySize: String(partySize),
      cuisine
    });

    router.push(`/search?${query.toString()}`);
  }

  return (
    <main className="min-h-screen bg-dinner-charcoal">
      <section className="relative isolate min-h-screen overflow-hidden px-4 py-14 sm:px-6 lg:px-8" style={{ backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 backdrop-blur-xl bg-black/60" aria-hidden="true" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10">
          <header className="max-w-3xl">
            <p className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-dinner-cream">
              Dinner Planner
            </p>
            <h1 className="mt-5 bg-gradient-to-r from-dinner-gold via-dinner-cream to-dinner-burgundy bg-[length:200%_200%] bg-clip-text text-5xl font-extrabold tracking-tight text-transparent animate-gradient sm:text-7xl">
              Find Your Perfect Table
            </h1>
            <p className="mt-5 text-lg text-dinner-cream/90 sm:text-xl">Premium restaurant discovery and booking designed for memorable evenings.</p>
          </header>

          <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr]">
            <form onSubmit={handleSubmit} className="w-full rounded-3xl border border-white/20 bg-white/10 p-6 shadow-card backdrop-blur-xl sm:max-w-md sm:p-8 lg:max-w-none">
              <h2 className="text-2xl font-semibold text-white">Find Available Restaurants</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-dinner-cream">
                  Date
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="mt-1 min-h-12 w-full rounded-xl border border-white/30 bg-white/20 px-3 py-2.5 text-white outline-none transition placeholder:text-white/70 focus:border-dinner-gold focus:ring-4 focus:ring-dinner-gold/20"
                    aria-label="Date"
                  />
                </label>

                <label className="text-sm font-medium text-dinner-cream">
                  Time
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    className="mt-1 min-h-12 w-full rounded-xl border border-white/30 bg-white/20 px-3 py-2.5 text-white outline-none transition focus:border-dinner-gold focus:ring-4 focus:ring-dinner-gold/20"
                    aria-label="Time"
                  />
                </label>

                <label className="text-sm font-medium text-dinner-cream">
                  Party Size
                  <input
                    type="number"
                    min={1}
                    required
                    value={partySize}
                    onChange={(event) => setPartySize(Number(event.target.value))}
                    className="mt-1 min-h-12 w-full rounded-xl border border-white/30 bg-white/20 px-3 py-2.5 text-white outline-none transition focus:border-dinner-gold focus:ring-4 focus:ring-dinner-gold/20"
                    aria-label="Party Size"
                  />
                </label>

                <label className="text-sm font-medium text-dinner-cream">
                  Cuisine (optional)
                  <input
                    type="text"
                    placeholder="Italian, Sushi, Steakhouse"
                    value={cuisine}
                    onChange={(event) => setCuisine(event.target.value)}
                    className="mt-1 min-h-12 w-full rounded-xl border border-white/30 bg-white/20 px-3 py-2.5 text-white outline-none transition placeholder:text-white/70 focus:border-dinner-gold focus:ring-4 focus:ring-dinner-gold/20"
                    aria-label="Cuisine"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-dinner-gold to-dinner-burgundy px-5 py-3 font-semibold text-white transition duration-300 hover:scale-105 hover:shadow-xl"
              >
                Find Available Restaurants
              </button>
            </form>

            <aside className="relative rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl sm:p-8">
              <h2 className="text-2xl font-semibold text-white">How It Works</h2>
              <span className="absolute left-[2.1rem] top-[6.5rem] h-[calc(100%-8rem)] w-0.5 bg-gradient-to-b from-dinner-gold via-dinner-gold/70 to-dinner-burgundy" aria-hidden="true" />
              <ol className="relative mt-8 space-y-8 pl-4">
                {steps.map((step, index) => (
                  <li key={step.title} className="relative pl-10 text-sm text-dinner-cream/90">
                    <span className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-dinner-gold to-dinner-burgundy text-sm font-bold text-white shadow-lg">
                      {index + 1}
                    </span>
                    <p className="font-semibold text-dinner-gold">Step {index + 1}</p>
                    <p className="mt-1 font-semibold text-white">{step.title}</p>
                    <p className="mt-1">{step.text}</p>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
