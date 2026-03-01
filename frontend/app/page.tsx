"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [cuisine, setCuisine] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = new URLSearchParams({
      date,
      time,
      partySize: String(partySize),
      cuisine,
    });

    router.push(`/search?${query.toString()}`);
  }

  return (
    <main className="min-h-screen bg-hero-glow">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          <p className="inline-flex rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink">
            Dinner Planner
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink sm:text-5xl">Book the right table, fast.</h1>
          <p className="mt-4 text-lg text-ink/75">
            Search available restaurants by date, time, and party size. Confirm your booking in under a minute.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.25fr,1fr]">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-ink/10 bg-white p-6 shadow-card sm:p-8">
            <h2 className="text-2xl font-semibold">Find Available Restaurants</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-ink/80">
                Date
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink/20 bg-white px-3 py-2.5 outline-none ring-brand transition focus:ring-2"
                />
              </label>

              <label className="text-sm font-medium text-ink/80">
                Time
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink/20 bg-white px-3 py-2.5 outline-none ring-brand transition focus:ring-2"
                />
              </label>

              <label className="text-sm font-medium text-ink/80">
                Party Size
                <input
                  type="number"
                  min={1}
                  required
                  value={partySize}
                  onChange={(event) => setPartySize(Number(event.target.value))}
                  className="mt-1 w-full rounded-xl border border-ink/20 bg-white px-3 py-2.5 outline-none ring-brand transition focus:ring-2"
                />
              </label>

              <label className="text-sm font-medium text-ink/80">
                Cuisine (optional)
                <input
                  type="text"
                  placeholder="Italian, Sushi, Steakhouse"
                  value={cuisine}
                  onChange={(event) => setCuisine(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-ink/20 bg-white px-3 py-2.5 outline-none ring-brand transition focus:ring-2"
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-brand px-5 py-3 font-semibold text-white transition hover:bg-brand/90"
            >
              Find Available Restaurants
            </button>
          </form>

          <aside className="rounded-3xl border border-ink/10 bg-white/70 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">How It Works</h2>
            <ol className="mt-6 space-y-5 text-sm text-ink/80">
              <li className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">Step 1</p>
                <p className="mt-1">Enter your date, time, party size, and cuisine preference.</p>
              </li>
              <li className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">Step 2</p>
                <p className="mt-1">Review available restaurants and choose the best fit.</p>
              </li>
              <li className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">Step 3</p>
                <p className="mt-1">Confirm details and get your booking confirmation code.</p>
              </li>
            </ol>
          </aside>
        </div>
      </section>
    </main>
  );
}
